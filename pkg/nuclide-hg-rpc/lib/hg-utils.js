/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {HgExecOptions} from './hg-exec-types';

import {Observable} from 'rxjs';
import {runCommandDetailed, ProcessExitError} from 'nuclide-commons/process';
import {getLogger} from 'log4js';
import fsPromise from 'nuclide-commons/fsPromise';
import {
  getOriginalEnvironment,
  observeProcess,
  runCommand,
} from 'nuclide-commons/process';
import {getConnectionDetails} from '../../nuclide-remote-atom-rpc';
import nuclideUri from 'nuclide-commons/nuclideUri';

// Mercurial (as of v3.7.2) [strips lines][1] matching the following prefix when a commit message is
// created by an editor invoked by Mercurial. Because Nuclide is not invoked by Mercurial, Nuclide
// must mimic the same stripping.
//
// Note: `(?m)` converts to `/m` in JavaScript-flavored RegExp to mean 'multiline'.
//
// [1] https://selenic.com/hg/file/3.7.2/mercurial/cmdutil.py#l2734
const COMMIT_MESSAGE_STRIP_LINE = /^HG:.*(\n|$)/gm;

// Avoid spamming the hg blackbox with read-only hg commands.
const EXCLUDE_FROM_HG_BLACKBOX_COMMANDS = new Set([
  // 'bookmarks' is technically another read-only command, but the possible
  //  --rename/--delete options make this detection unreliable.
  'cat',
  'config', // Nuclide only ever *reads* the config.
  'diff',
  'log',
  'show',
  'status',
]);

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
export const :[fn~\w+] = async (
  args_: Array<string>,
  options_: HgExecOptions,
) =>: Promise<any> {
  const {command, args, options} = await getHgExecParams(args_, options_);
  try {
    return await runCommandDetailed(command, args, options).toPromise();
  } catch (err) {
    logAndThrowHgError(args, options, err);
  }
}

/**
 * Calls hg commands, returning an Observable to allow aborting and streaming progress output.
 */
export const :[fn~\w+] = (
  args_: Array<string>,
  options_: HgExecOptions,
) =>: Observable<LegacyProcessMessage> {
  // TODO(T17463635)
  return Observable.fromPromise(
    getHgExecParams(args_, {
      ...(options_: any),
      TTY_OUTPUT: process.platform !== 'win32',
    }),
  ).switchMap(({command, args, options}) => {
    return observeProcess(command, args, {
      ...options,
      killTreeWhenDone: true,
      /* TODO(T17353599) */ isExitError: () => false,
    }).catch(error => Observable.of({kind: 'error', error})); // TODO(T17463635)
  });
}

/**
 * Calls hg commands, returning an Observable to allow aborting.
 * Resolves to stdout.
 */
export const :[fn~\w+] = (
  args_: Array<string>,
  options_: HgExecOptions,
) =>: Observable<string> {
  return Observable.fromPromise(getHgExecParams(args_, options_)).switchMap(
    ({command, args, options}) =>
      runCommand(command, args, {...options, killTreeWhenDone: true}),
  );
}

const :[fn~\w+] = (
  args: Array<string>,
  options: Object,
  err: Error,
) =>: void {
  if (err instanceof ProcessExitError) {
    getLogger('nuclide-hg-rpc').error(
      `Error executing hg command: ${JSON.stringify(args)}\n` +
        `stderr: ${err.stderr}\nstdout: ${String(err.stdout)}\n` +
        `options: ${JSON.stringify(options)}`,
    );
    const {stdout, stderr, exitCode} = err;
    let message = 'hg error';
    if (exitCode != null) {
      message += ` (exit code ${exitCode})`;
    }
    if (stderr.length > 0) {
      message += `\nstderr: ${stderr}`;
    }
    if (stdout != null && stdout.length > 0) {
      message += `\nstdout: ${stdout}`;
    }
    throw new Error(message);
  } else {
    getLogger('nuclide-hg-rpc').error(
      `Error executing hg command: ${JSON.stringify(args)}\n` +
        `options: ${JSON.stringify(options)}`,
    );
    throw err;
  }
}

const :[fn~\w+] = async (
  args_: Array<string>,
  options_: HgExecOptions,
) =>: Promise<{command: string, args: Array<string>, options: Object}> {
  let args = [
    ...args_,
    '--noninteractive',
    // Prevent user-specified merge tools from attempting to
    // open interactive editors.
    '--config',
    options_.useMerge3 === true ? 'ui.merge=:merge3' : 'ui.merge=:merge',
  ];
  let sshCommand;
  // expandHomeDir is not supported on windows
  if (process.platform !== 'win32') {
    const pathToSSHConfig = nuclideUri.expandHomeDir('~/.atom/scm_ssh.sh');
    const doesSSHConfigExist = await fsPromise.exists(pathToSSHConfig);
    if (doesSSHConfigExist) {
      sshCommand = pathToSSHConfig;
    } else {
      // Disabling ssh keyboard input so all commands that prompt for interaction
      // fail instantly rather than just wait for an input that will never arrive
      sshCommand = 'ssh -oBatchMode=yes -oControlMaster=no';
    }
    args.push(
      '--config',
      `ui.ssh=${sshCommand}`,
      // enable the progressfile extension
      '--config',
      'extensions.progressfile=',
      // have the progressfile extension write to 'progress' in the repo's .hg directory
      '--config',
      `progress.statefile=${options_.cwd}/.hg/progress`,
      // Without assuming hg is being run in a tty, the progress extension won't get used
      '--config',
      'progress.assume-tty=1',
      // Never show progress bar in stdout since we use the progressfile
      '--config',
      'progress.renderer=none',
      // Prevent scary error message on amend in the middle of a stack
      '--config',
      'fbamend.education=',
    );
  }
  const [hgCommandName] = args;
  if (EXCLUDE_FROM_HG_BLACKBOX_COMMANDS.has(hgCommandName)) {
    args.push('--config', 'extensions.blackbox=!');
  }
  const options = {
    ...options_,
    env: {
      LANG: 'en_US.utf-8', // make sure hg uses unicode if user hasn't set LANG themselves
      ...(await getOriginalEnvironment()),
      ATOM_BACKUP_EDITOR: 'false',
    },
  };
  if (!options.NO_HGPLAIN) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    options.env.HGPLAIN = 1;
    // Make an exception for plain mode so the progress file gets written
    options.env.HGPLAINEXCEPT = 'progress';
  }
  if (options.HGEDITOR != null) {
    options.env.HGEDITOR = options.HGEDITOR;
  }

  const command = 'hg';
  if (options.TTY_OUTPUT) {
    // HG commit/amend have unconventional ways of escaping slashes from messages.
    // We have to 'unescape' to make it work correctly.
    args = args.map(arg => arg.replace(/\\\\/g, '\\'));
  }
  return {command, args, options};
}

export const :[fn~\w+] = (commitMessage: string) =>: string {
  return commitMessage.replace(COMMIT_MESSAGE_STRIP_LINE, '');
}

export const :[fn~\w+] = async () =>: Promise<?{
  args: Array<string>,
  hgEditor: string,
}> {
  const connectionDetails = await getConnectionDetails();
  if (connectionDetails == null) {
    getLogger('nuclide-hg-rpc').error('CommandServer not initialized!');
    return null;
  }
  // Atom RPC needs to agree with the Atom process / nuclide server on the address and port.
  const hgEditor =
    getAtomRpcScriptPath() +
    ` -f ${connectionDetails.family} -p ${connectionDetails.port} --wait`;
  return {
    args: [
      '--config',
      'ui.interface.chunkselector=editor',
      '--config',
      'extensions.edrecord=',
    ],
    hgEditor,
  };
}

let atomRpcEditorPath;

const :[fn~\w+] = () =>: string {
  if (atomRpcEditorPath == null) {
    try {
      atomRpcEditorPath = require.resolve(
        '../../nuclide-remote-atom-rpc/bin/fb-atom',
      );
    } catch (error) {
      atomRpcEditorPath = require.resolve(
        '../../nuclide-remote-atom-rpc/bin/atom',
      );
    }
  }
  return atomRpcEditorPath;
}
