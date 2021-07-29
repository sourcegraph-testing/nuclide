/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

export type TokenKind =
  | 'keyword'
  | 'class-name'
  | 'constructor'
  | 'method'
  | 'param'
  | 'string'
  | 'whitespace'
  | 'plain'
  | 'type';

export type TextToken = {
  kind: TokenKind,
  value: string,
};

export type TokenizedText = Array<TextToken>;

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('keyword', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('class-name', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('constructor', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('method', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('param', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('string', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('whitespace', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('plain', value);
}

export const :[fn~\w+] = (value: string) =>: TextToken {
  return _buildToken('type', value);
}

const :[fn~\w+] = (kind: TokenKind, value: string) =>: TextToken {
  return {kind, value};
}
