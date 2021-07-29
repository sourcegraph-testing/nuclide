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

import {
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
} from './utils/integration-test-helpers';

describe('nuclide-distraction-free-mode', () => {
  it('hides and shows things as expected', () => {
    waitsForPromise({timeout: 60000}, async () => {
      // Configure some jasmine specific things for integration testing.
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();

      const commandTarget = atom.views.getView(atom.workspace);

      runs(() => {
        atom.commands.dispatch(commandTarget, 'outline-view:toggle', {
          visible: true,
        });
      });
      waitsFor('outline view to appear for the first time', () => {
        return isOutlineViewVisible();
      });

      runs(() => {
        expect(isOutlineViewVisible()).toBeTruthy();

        atom.commands.dispatch(
          commandTarget,
          'nuclide-distraction-free-mode:toggle',
        );
      });

      waitsFor('outline view to disappear', () => {
        return !isOutlineViewVisible();
      });

      runs(() => {
        expect(isOutlineViewVisible()).toBeFalsy();

        atom.commands.dispatch(
          commandTarget,
          'nuclide-distraction-free-mode:toggle',
        );
      });

      waitsFor('outline view to come back', () => {
        return isOutlineViewVisible();
      });

      runs(() => {
        expect(isOutlineViewVisible()).toBeTruthy();
      });
      // Deactivate nuclide packages.
      waitsForPromise(deactivateAllPackages);
    });
  });
});

const :[fn~\w+] = () =>: boolean {
  let el = document.querySelector('.outline-view');
  if (el == null) {
    return false;
  }
  while (el != null) {
    if (el.clientHeight === 0 || el.clientWidth === 0) {
      return false;
    }
    el = el.parentElement;
  }
  return true;
}
