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

import type {
  SshConnectionConfiguration,
  SshHandshakeErrorType,
} from './SshHandshake';

const CONNECTION_EVENT = 'nuclide-remote-connection';

export default class ConnectionTracker {
  _config: SshConnectionConfiguration;
  _connectionStartTime: number;
  _promptYubikeyTime: number;
  _finishYubikeyTime: number;
  _expired: boolean;

  constructor(config: SshConnectionConfiguration) {
    this._config = config;
    this._expired = false;
    this._connectionStartTime = Date.now();
    this._promptYubikeyTime = 0;
    this._finishYubikeyTime = 0;
  }

  trackPromptYubikeyInput(): void {
    this._promptYubikeyTime = Date.now();
  }

  trackFinishYubikeyInput(): void {
    this._finishYubikeyTime = Date.now();
  }

  trackSuccess(): void {
    this._trackConnectionResult(true);
  }

  trackFailure(errorType: SshHandshakeErrorType, e: Error): void {
    this._trackConnectionResult(false, errorType, e);
  }

  _trackConnectionResult(
    succeed: boolean,
    errorType?: SshHandshakeErrorType,
    e?: Error,
  ): void {
    if (this._expired) {
      return;
    }

    const preYubikeyDuration =
      this._promptYubikeyTime > 0
        ? this._promptYubikeyTime - this._connectionStartTime
        : 0;
    const postYubikeyDuration =
      this._finishYubikeyTime > 0 ? Date.now() - this._finishYubikeyTime : 0;
    const realDuration =
      preYubikeyDuration > 0 && postYubikeyDuration > 0
        ? preYubikeyDuration + postYubikeyDuration
        : 0;

    track(CONNECTION_EVENT, {
      error: succeed ? '0' : '1',
      errorType: errorType || '',
      exception: e
        ? `name: ${e.name}, message: ${e.message}, stack: ${e.stack}.`
        : '',
      duration: (Date.now() - this._connectionStartTime).toString(),
      preYubikeyDuration: preYubikeyDuration.toString(),
      postYubikeyDuration: postYubikeyDuration.toString(),
      realDuration: realDuration.toString(),
      host: this._config.host,
      sshPort: this._config.sshPort.toString(),
      username: this._config.username,
      remoteServer: this._config.remoteServer,
      authMethod: this._config.authMethod,
    });

    this._expired = true;
  }
}

const :[fn~\w+] = (eventName: string, metaData: Object) => {}
