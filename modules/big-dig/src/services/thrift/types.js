/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export const THRIFT_SERVICE_TAG = 'thrift-services';

export type ThriftServiceConfig = {
  // service name
  name: string,
  // uri of the thrift server
  remoteUri: NuclideUri,
  // path to run the thrift server
  remoteCommand: string,
  // args sent in execution of command above
  remoteCommandArgs: Array<string>,
  // port number which server is listening
  remotePort: number,
  // thrift transport used to communicate
  thriftTransport: 'framed' | 'buffered',
  // thrift protocol used to communicate
  thriftProtocol: 'binary' | 'compact' | 'json',
  // service generated by Thrift
  thriftService: mixed,
  // kill old server process when starting server for the first time.
  killOldThriftServerProcess: boolean,
};

// a subset of attributes from ThriftServiceConfig
export type ThriftServerConfig = {
  // thrift service name
  name: string,
  // remote command to manage thrift server
  remoteCommand: string,
  // remote command args sent along with the command above
  remoteCommandArgs: Array<string>,
  // remote server port number
  remotePort: number,
  // kill old server process when starting server for the first time.
  killOldThriftServerProcess: boolean,
};

export type ThriftMessagePayload = Request | SuccessResponse | FailureResponse;

export type Request = {
  type: 'request',
  command: 'start-server' | 'stop-server',
  serverConfig: ThriftServerConfig,
};
export type ThriftServiceCommand = $PropertyType<Request, 'command'>;

export type SuccessResponse = {
  type: 'response',
  success: true,
  port?: string,
};

export type FailureResponse = {
  type: 'response',
  success: false,
  error: string,
};

export type ThriftMessage = {
  id: string,
  payload: ThriftMessagePayload,
};

export type ThrifClientSubscription = {unsubscribe: () => void};

export type ClientCloseCallBack = () => void;

export interface ThriftClient {
  getClient<T>(): T;
  close(): void;
  onConnectionEnd(handler: ClientCloseCallBack): ThrifClientSubscription;
  onUnexpectedConnectionEnd(
    handler: ClientCloseCallBack,
  ): ThrifClientSubscription;
}
