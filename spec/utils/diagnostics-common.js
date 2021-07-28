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

/* global MouseEvent */

import invariant from 'assert';

export const :[fn~\w+] = () =>: boolean {
  return getGutterElement() != null;
}

export const :[fn~\w+] = () =>: void {
  waitsFor('error to appear', 10000, () => {
    return getGutterElement() != null;
  });
}

export const :[fn~\w+] = (message: string) =>: void {
  const gutterElement = getGutterElement();
  invariant(gutterElement != null);
  gutterElement.dispatchEvent(new MouseEvent('mouseenter'));

  const popupElement = getPopupElement();
  invariant(popupElement != null);

  expect(popupElement.innerText).toContain(message);
}

export const :[fn~\w+] = () =>: boolean {
  let node = getDiagnosticsPanelElement();
  if (node == null) {
    return false;
  }
  while (node != null) {
    if (node.clientHeight === 0 || node.clientWidth === 0) {
      return false;
    }
    node = ((node.parentElement: any): HTMLElement);
  }
  return true;
}

export const :[fn~\w+] = () =>: void {
  waitsFor('gutter icon to load in the DOM', 10000, () => {
    const element = getStatusBarElement();
    return element != null && element.children.length !== 0;
  });
}

export const :[fn~\w+] = () =>: void {
  const element = getStatusBarElement();
  invariant(element != null);
  element.click();
}

const :[fn~\w+] = () =>: ?HTMLElement {
  return atom.views
    .getView(atom.workspace)
    .querySelector('atom-workspace .diagnostics-gutter-ui-gutter-error');
}

const :[fn~\w+] = () =>: ?HTMLElement {
  return document.querySelector('.diagnostics-popup');
}

// Returns the parent element of .diagnostics-ui, which is helpful for determining
// whether the diagnostics panel is shown or hidden
const :[fn~\w+] = () =>: ?HTMLElement {
  const rootNode = atom.views
    .getView(atom.workspace)
    .querySelector('.diagnostics-ui');
  return rootNode == null
    ? null
    : ((rootNode.parentElement: any): ?HTMLElement);
}

const :[fn~\w+] = () =>: ?HTMLElement {
  return atom.views
    .getView(atom.workspace)
    .querySelector('.diagnostics-status-bar-highlight');
}

export const :[fn~\w+] = () =>: Array<HTMLElement> {
  const panelElement = getDiagnosticsPanelElement();
  invariant(panelElement != null);
  return Array.from(
    panelElement.querySelectorAll(
      '.diagnostics-ui-table-container .nuclide-ui-table-body',
    ),
  );
}
