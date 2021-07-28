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

import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import Inspector, {WORKSPACE_VIEW_URI} from './ui/Inspector';
import invariant from 'assert';
import * as React from 'react';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';

let disposables: ?UniversalDisposable = null;

export const :[fn~\w+] = () =>: void {
  disposables = new UniversalDisposable(registerCommandAndOpener());
}

export const :[fn~\w+] = () =>: void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

const :[fn~\w+] = () =>: UniversalDisposable {
  return new UniversalDisposable(
    atom.workspace.addOpener(uri => {
      if (uri === WORKSPACE_VIEW_URI) {
        return viewableFromReactElement(<Inspector />);
      }
    }),
    () => destroyItemWhere(item => item instanceof Inspector),
    atom.commands.add(
      'atom-workspace',
      'nuclide-react-inspector:toggle',
      () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      },
    ),
  );
}
