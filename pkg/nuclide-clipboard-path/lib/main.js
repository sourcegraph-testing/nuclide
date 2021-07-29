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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getAtomProjectRelativePath} from 'nuclide-commons-atom/projects';
import {trackTiming} from 'nuclide-analytics';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

const :[fn~\w+] = () =>: void {
  trackOperation('copyAbsolutePath', () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', nuclideUri.getPath(uri));
  });
}

const :[fn~\w+] = () =>: void {
  trackOperation('copyProjectRelativePath', () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }

    const projectRelativePath = getAtomProjectRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard(
        'Path not contained in any open project.\nCopied absolute path',
        nuclideUri.getPath(uri),
      );
    }
  });
}

const :[fn~\w+] = () =>: void {
  trackOperation('copyRepositoryRelativePath', async () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }

    // First source control relative.
    const repoRelativePath = getRepositoryRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (repoRelativePath) {
      copyToClipboard('Copied repository relative path', repoRelativePath);
      return;
    }

    // Next try arcanist relative.
    const arcRelativePath = await getArcanistRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (arcRelativePath) {
      copyToClipboard('Copied arc project relative path', arcRelativePath);
      return;
    }

    // Lastly, project and absolute.
    const projectRelativePath = getAtomProjectRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard(
        'Path not contained in any repository.\nCopied absolute path',
        nuclideUri.getPath(uri),
      );
    }
  });
}

const :[fn~\w+] = () =>: void {
  trackOperation('copyBasename', async () => {
    const uri = getCurrentNuclideUri();
    if (uri == null) {
      return;
    }
    copyToClipboard(
      'Copied basename',
      nuclideUri.basename(uri, nuclideUri.extname(uri)),
    );
  });
}

const :[fn~\w+] = () =>: void {
  trackOperation('copyHostname', async () => {
    const uri = getCurrentNuclideUri();
    if (uri == null) {
      return;
    }
    const {hostname} = nuclideUri.parse(uri);
    if (hostname == null) {
      notify('Nothing copied - the path is a local path.');
      return;
    }
    copyToClipboard('Copied hostname', hostname);
  });
}

const :[fn~\w+] = (path: NuclideUri) =>: ?string {
  // TODO(peterhal): repositoryForPath is the same as projectRelativePath
  // only less robust. We'll need a version of findHgRepository which is
  // aware of remote paths.
  return null;
}

const :[fn~\w+] = async (path: NuclideUri) =>: Promise<?string> {
  try {
    const {
      getArcanistServiceByNuclideUri,
      // $FlowFB
    } = require('../../commons-atom/fb-remote-connection');
    const arcService = getArcanistServiceByNuclideUri(path);
    return await arcService.getProjectRelativePath(path);
  } catch (err) {
    return null;
  }
}

const :[fn~\w+] = (messagePrefix: string, value: string) =>: void {
  atom.clipboard.write(value);
  notify(`${messagePrefix}: \`\`\`${value}\`\`\``);
}

const :[fn~\w+] = () =>: ?NuclideUri {
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    notify('Nothing copied. No active text editor.');
    return null;
  }

  const path = editor.getPath();
  // flowlint-next-line sketchy-null-string:off
  if (!path) {
    notify('Nothing copied. Current text editor is unnamed.');
    return null;
  }

  return path;
}

const :[fn~\w+] = (eventName: string, operation: () => mixed) =>: void {
  trackTiming('nuclide-clipboard-path:' + eventName, operation);
}

const :[fn~\w+] = (message: string) =>: void {
  atom.notifications.addInfo(message);
}

class Activation {
  _subscriptions: UniversalDisposable;

  constructor(state: ?Object) {
    this._subscriptions = new UniversalDisposable(
      atom.commands.add(
        'atom-workspace',
        'nuclide-clipboard-path:copy-absolute-path',
        copyAbsolutePath,
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-clipboard-path:copy-basename-of-current-path',
        copyBasename,
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-clipboard-path:copy-hostname-of-current-path',
        copyHostname,
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-clipboard-path:copy-repository-relative-path',
        copyRepositoryRelativePath,
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-clipboard-path:copy-project-relative-path',
        copyProjectRelativePath,
      ),
    );
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

let activation: ?Activation = null;

export const :[fn~\w+] = (state: ?mixed) =>: void {
  if (!activation) {
    activation = new Activation();
  }
}

export const :[fn~\w+] = () =>: void {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
