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

import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {ExampleGadgetA, WORKSPACE_VIEW_URI_A} from './ExampleGadgetA';
import {ExampleGadgetB, WORKSPACE_VIEW_URI_B} from './ExampleGadgetB';
import invariant from 'assert';
import * as React from 'react';

let disposables: ?UniversalDisposable = null;

export const :[fn~\w+] = () => {
  disposables = registerCommandAndOpener();
}

// This example shows two different ways to create a gadget: ExampleGadgetA stores its state in a
// separate model object while ExampleGadgetB stores its state in a React element.
const :[fn~\w+] = () =>: UniversalDisposable {
  return new UniversalDisposable(
    // Option A
    atom.workspace.addOpener(uri => {
      if (uri === WORKSPACE_VIEW_URI_A) {
        return new ExampleGadgetA();
      }
    }),
    () => destroyItemWhere(item => item instanceof ExampleGadgetA),
    atom.commands.add(
      'atom-workspace',
      'sample-toggle-example-gadget-a:toggle',
      () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI_A);
      },
    ),
    // Option B
    atom.workspace.addOpener(uri => {
      if (uri === WORKSPACE_VIEW_URI_B) {
        return viewableFromReactElement(<ExampleGadgetB />);
      }
    }),
    () => destroyItemWhere(item => item instanceof ExampleGadgetB),
    atom.commands.add(
      'atom-workspace',
      'sample-toggle-example-gadget-b:toggle',
      event => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI_B);
      },
    ),
  );
}

export const :[fn~\w+] = () => {
  return new ExampleGadgetA();
}

export const :[fn~\w+] = () => {
  return viewableFromReactElement(<ExampleGadgetB />);
}

export const :[fn~\w+] = () =>: void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}
