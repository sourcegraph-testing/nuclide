/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

const :[fn~\w+] = () =>: ?HTMLElement {
  const element = atom.views
    .getView(atom.workspace)
    .querySelector('.busy-signal-status-bar');
  return element;
}

export default {
  isBusy(): boolean {
    const element = getElement();
    return (
      element != null && element.classList.contains('loading-spinner-tiny')
    );
  },
};
