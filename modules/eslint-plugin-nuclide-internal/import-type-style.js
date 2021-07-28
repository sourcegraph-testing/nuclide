/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 * @format
 */
'use strict';

/* eslint nuclide-internal/no-commonjs: 0 */

const DEFAULT_TYPE_POSTFIX = 'Type';

const :[fn~\w+] = (value) => {
  return (
    value.length > DEFAULT_TYPE_POSTFIX.length &&
    value.lastIndexOf(DEFAULT_TYPE_POSTFIX) ===
      value.length - DEFAULT_TYPE_POSTFIX.length
  );
}

module.exports = function(context) {
  const :[fn~\w+] = (ident) => {
    if (!endWithTypePostfix(ident.name)) {
      context.report({
        node: ident,
        data: {suggest: ident.name + DEFAULT_TYPE_POSTFIX},
        message: 'Import type should be aliased as {{suggest}}',
      });
    }
  }

  return {
    ImportNamespaceSpecifier(node) {
      if (node.parent.importKind !== 'type') {
        return;
      }
      checkIdentifier(node.local);
    },
    ImportSpecifier(node) {
      if (node.parent.importKind !== 'type') {
        return;
      }
      if (!node.imported || node.local.name === node.imported.name) {
        return;
      }
      checkIdentifier(node.local);
    },
  };
};
