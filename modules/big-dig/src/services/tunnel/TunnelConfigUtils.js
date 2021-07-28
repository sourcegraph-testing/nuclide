/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {ProxyConfig, TunnelConfig} from './types';

import {matchProxyConfig} from './ProxyConfigUtils';

export const :[fn~\w+] = (
  tunnelConfig: TunnelConfig,
  isReverse: boolean,
) =>: string {
  return `${getDescriptorForProxyConfig(tunnelConfig.local)}${
    isReverse ? '<-' : '->'
  }${getDescriptorForProxyConfig(tunnelConfig.remote)}`;
}

const :[fn~\w+] = (proxyConfig: ProxyConfig) =>: string {
  return matchProxyConfig(
    {
      tcp: config => String(config.port),
      ipcSocket: config => config.path,
    },
    proxyConfig,
  );
}
