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

import type {ClangCompileResult} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {LinterMessage} from 'atom-ide-ui';

import {track, trackTiming} from 'nuclide-analytics';
import {isHeaderFile} from '../../nuclide-clang-rpc/lib/utils';
import {DEFAULT_FLAGS_WARNING, HEADER_DEFAULT_FLAGS_WARNING} from './constants';
import {getDiagnostics} from './libclang';
import invariant from 'assert';
import {getLogger} from 'log4js';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {wordAtPosition} from 'nuclide-commons-atom/range';

const IDENTIFIER_REGEX = /[a-z0-9_]+/gi;

const :[fn~\w+] = (clangRange: atom$Range) =>: boolean {
  // Some ranges are unbounded/invalid (end with -1) or empty.
  return (
    clangRange.start.row !== -1 &&
    clangRange.end.row !== -1 &&
    !clangRange.start.isEqual(clangRange.end)
  );
}

const :[fn~\w+] = (
  editor: atom$TextEditor,
  location: atom$Point,
) =>: atom$Range {
  if (location.row < 0) {
    return editor.getBuffer().rangeForRow(0);
  }
  // Attempt to match a C/C++ identifier at the given location.
  const word = wordAtPosition(editor, location, IDENTIFIER_REGEX);
  if (word != null) {
    return word.range;
  }
  return editor.getBuffer().rangeForRow(location.row);
}

export default class ClangLinter {
  static lint(textEditor: atom$TextEditor): Promise<Array<LinterMessage>> {
    return trackTiming('nuclide-clang-atom.fetch-diagnostics', () =>
      ClangLinter._lint(textEditor),
    );
  }

  static async _lint(
    textEditor: atom$TextEditor,
  ): Promise<Array<LinterMessage>> {
    const filePath = textEditor.getPath();
    if (filePath == null) {
      return [];
    }

    try {
      const diagnostics = await getDiagnostics(textEditor);
      // Editor may have been destroyed during the fetch.
      if (diagnostics == null || textEditor.isDestroyed()) {
        return [];
      }

      track('nuclide-clang-atom.fetch-diagnostics', {
        filePath,
        count: String(diagnostics.diagnostics.length),
        accurateFlags: String(diagnostics.accurateFlags),
      });
      return ClangLinter._processDiagnostics(diagnostics, textEditor);
    } catch (error) {
      getLogger('nuclide-clang').error(
        `ClangLinter: error linting ${filePath}`,
        error,
      );
      return [];
    }
  }

  static _processDiagnostics(
    data: ClangCompileResult,
    editor: atom$TextEditor,
  ): Array<LinterMessage> {
    const result = [];
    const buffer = editor.getBuffer();
    const bufferPath = buffer.getPath();
    invariant(bufferPath != null);
    if (
      data.accurateFlags ||
      featureConfig.get('nuclide-clang.defaultDiagnostics')
    ) {
      data.diagnostics.forEach(diagnostic => {
        // We show only warnings, errors and fatals (2, 3 and 4, respectively).
        if (diagnostic.severity < 2) {
          return;
        }

        let range;
        if (diagnostic.ranges && isValidRange(diagnostic.ranges[0].range)) {
          // Use the first range from the diagnostic as the range for Linter.
          range = diagnostic.ranges[0].range;
        } else {
          range = getRangeFromPoint(editor, diagnostic.location.point);
        }

        // flowlint-next-line sketchy-null-string:off
        const filePath = diagnostic.location.file || bufferPath;

        let trace;
        if (diagnostic.children != null) {
          trace = diagnostic.children.map(child => {
            return {
              type: 'Trace',
              text: child.spelling,
              // flowlint-next-line sketchy-null-string:off
              filePath: child.location.file || bufferPath,
              range: getRangeFromPoint(editor, child.location.point),
            };
          });
        }

        let fix;
        if (diagnostic.fixits != null) {
          // TODO: support multiple fixits (if it's ever used at all)
          const fixit = diagnostic.fixits[0];
          if (fixit != null) {
            fix = {
              range: fixit.range.range,
              newText: fixit.value,
            };
          }
        }

        result.push({
          type: diagnostic.severity === 2 ? 'Warning' : 'Error',
          filePath,
          text: diagnostic.spelling,
          range,
          trace,
          fix,
        });
      });
    } else {
      result.push({
        type: 'Info',
        filePath: bufferPath,
        text: isHeaderFile(bufferPath)
          ? HEADER_DEFAULT_FLAGS_WARNING
          : DEFAULT_FLAGS_WARNING,
        range: buffer.rangeForRow(0),
      });
    }

    return result;
  }
}
