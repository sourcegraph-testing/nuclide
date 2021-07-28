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

import type {ConsoleLevel, ConsoleMessage} from 'atom-ide-ui';
import type {AslLevel, AslRecord} from './types';

import {parseMessageText} from './parseMessageText';

/**
 * Convert a structured logcat entry into the format that nuclide-console wants.
 */
export const :[fn~\w+] = (record: AslRecord) =>: ConsoleMessage {
  const {text, level, tags} = parseMessageText(record.Message);
  if (record.Facility) {
    tags.push(record.Facility);
  }
  return {
    text,
    level: level == null ? getLevel(record.Level) : level,
    tags: tags.length === 0 ? undefined : tags,
  };
}

const :[fn~\w+] = (level: AslLevel) =>: ConsoleLevel {
  switch (level) {
    case '0': // Emergency
    case '1': // Alert
    case '2': // Critical
    case '3': // Error
      return 'error';
    case '4': // Warning
      return 'warning';
    case '5': // Notice
      return 'log';
    case '6': // Info
      return 'info';
    case '7': // Debug
      return 'debug';
    default:
      (level: empty);
      throw new Error(`Invalid ASL level: ${level}`);
  }
}
