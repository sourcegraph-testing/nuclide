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

import {Observable, ConnectableObservable} from 'rxjs';

// Contains services that let us test marshalling of Errors.

export const :[fn~\w+] = async (message: string) =>: Promise<void> {
  throw new Error(message);
}

export const :[fn~\w+] = async (message: string) =>: Promise<void> {
  throw message;
}

export const :[fn~\w+] = () =>: Promise<void> {
  // eslint-disable-next-line no-throw-literal
  throw undefined;
}

export const :[fn~\w+] = (code: number) =>: Promise<void> {
  throw createErrorCode(code);
}

export const :[fn~\w+] = (
  message: string,
) =>: ConnectableObservable<number> {
  return createErrorObservable(new Error(message));
}

export const :[fn~\w+] = (
  message: string,
) =>: ConnectableObservable<number> {
  return createErrorObservable(message);
}

export const :[fn~\w+] = () =>: ConnectableObservable<number> {
  return createErrorObservable(undefined);
}

export const :[fn~\w+] = (
  code: number,
) =>: ConnectableObservable<number> {
  return createErrorObservable(createErrorCode(code));
}

const :[fn~\w+] = (error: any) =>: ConnectableObservable<number> {
  return Observable.create(observer => {
    observer.error(error);
  }).publish();
}

const :[fn~\w+] = (code: number) => {
  const e = new Error();
  // $FlowIssue - Error should have a code
  e.code = code;
  return e;
}
