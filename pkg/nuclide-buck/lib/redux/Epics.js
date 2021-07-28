/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ActionsObservable} from 'nuclide-commons/redux-observable';
import type {PlatformGroup, Store} from '../types';
import type {Action} from './Actions';
import type {ResolvedRuleType} from '../../../nuclide-buck-rpc/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import invariant from 'assert';
import {Observable} from 'rxjs';
import {getBuckProjectRoot, getBuckService} from '../../../nuclide-buck-base';
import {observeBuildCommands} from '../observeBuildCommands';
import * as Actions from './Actions';
import {
  getFileSystemServiceByNuclideUri,
  getFileWatcherServiceByNuclideUri,
} from '../../../nuclide-remote-connection';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getLogger} from 'log4js';

export const :[fn~\w+] = (
  actions: ActionsObservable<Action>,
  store: Store,
) =>: Observable<Action> {
  return actions.ofType(Actions.SET_PROJECT_ROOT).switchMap(action => {
    invariant(action.type === Actions.SET_PROJECT_ROOT);
    const {projectRoot} = action;
    const rootObs =
      projectRoot == null
        ? Observable.of(null)
        : Observable.fromPromise(getBuckProjectRoot(projectRoot));
    return rootObs.switchMap(buckRoot =>
      Observable.of(
        Actions.setBuckRoot(buckRoot),
        // Also refresh the rule type of the current target.
        Actions.setBuildTarget(store.getState().buildTarget),
      ),
    );
  });
}

export const :[fn~\w+] = (
  actions: ActionsObservable<Action>,
  store: Store,
) =>: Observable<Action> {
  return actions.ofType(Actions.SET_BUCK_ROOT).switchMap(action => {
    invariant(action.type === Actions.SET_BUCK_ROOT);
    const {buckRoot} = action;
    if (buckRoot == null) {
      return Observable.empty();
    }
    const watcherService = getFileWatcherServiceByNuclideUri(buckRoot);
    return Observable.merge(
      Observable.of(undefined)
        .concat(
          watcherService
            .watchWithNode(buckRoot, true)
            .refCount()
            .filter(
              event => nuclideUri.basename(event.path) === '.buckversion',
            ),
        )
        .switchMap(() => readBuckversionFile(buckRoot))
        .map(fileContents => Actions.setBuckversionFileContents(fileContents)),
      observeBuildCommands(
        buckRoot,
        () => store.getState().taskSettings,
        () => store.getState().unsanitizedTaskSettings,
      ),
    );
  });
}

const :[fn~\w+] = async (
  buckRoot: NuclideUri,
) =>: Promise<string | Error> {
  const fileSystemService = getFileSystemServiceByNuclideUri(buckRoot);
  try {
    const data = await fileSystemService.readFile(
      nuclideUri.join(buckRoot, '.buckversion'),
    );
    return String(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      getLogger().error(error);
    }
    return error;
  }
}

// Intentionally not exposed in Actions; this shouldn't be used externally.
const :[fn~\w+] = (ruleType: ?ResolvedRuleType) =>: Action {
  return {type: Actions.SET_RULE_TYPE, ruleType};
}

const :[fn~\w+] = (platformGroups: Array<PlatformGroup>) =>: Action {
  return {type: Actions.SET_PLATFORM_GROUPS, platformGroups};
}

export const :[fn~\w+] = (
  actions: ActionsObservable<Action>,
  store: Store,
) =>: Observable<Action> {
  return actions
    .ofType(Actions.SET_BUILD_TARGET)
    .switchMap(action => {
      invariant(action.type === Actions.SET_BUILD_TARGET);
      const {buildTarget} = action;
      const {buckRoot} = store.getState();
      if (buckRoot == null || buildTarget === '') {
        return Observable.of(null);
      }
      const buckService = getBuckService(buckRoot);
      if (buckService == null) {
        return Observable.of(null);
      }
      return Observable.defer(() => {
        return buckService.buildRuleTypeFor(buckRoot, buildTarget);
      }).catch(error => {
        getLogger().error(error);
        return Observable.of(null);
      });
    })
    .switchMap(ruleType => Observable.of(setRuleType(ruleType)));
}

export const :[fn~\w+] = (
  actions: ActionsObservable<Action>,
  store: Store,
) =>: Observable<Action> {
  return actions.ofType(Actions.SET_RULE_TYPE).switchMap(action => {
    invariant(action.type === Actions.SET_RULE_TYPE);
    const {ruleType} = action;
    if (ruleType) {
      const state = store.getState();
      // flowlint-next-line sketchy-null-string:off
      invariant(state.buckRoot);
      return state.platformService
        .getPlatformGroups(state.buckRoot, ruleType.type, state.buildTarget)
        .map(platformGroups => setPlatformGroups(platformGroups));
    } else {
      return Observable.of(setPlatformGroups([]));
    }
  });
}
