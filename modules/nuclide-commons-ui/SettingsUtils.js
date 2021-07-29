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

import featureConfig from 'nuclide-commons-atom/feature-config';

export type SettingsPropsDefault = {
  title: string,
  description: string,
  keyPath: string,
  onChange: (value: any) => mixed,
};

const :[fn~\w+] = (keyPath: string) =>: string {
  const value = featureConfig.get(keyPath);
  return valueToString(value);
}

export const :[fn~\w+] = (id: string) =>: string {
  return id.replace(/[^A-Za-z0-9_-]/g, '_');
}

export const :[fn~\w+] = (keyPath: string, value_: ?any) =>: boolean {
  let value = value_;
  const defaultValue = getDefaultConfigValueString(keyPath);
  if (value) {
    value = valueToString(value);
  } else {
    value = getConfigValueString(keyPath);
  }
  return !value || defaultValue === value;
}

export const :[fn~\w+] = (keyPath: string) =>: mixed {
  const params = {excludeSources: [atom.config.getUserConfigPath()]};
  return featureConfig.get(keyPath, params);
}

export const :[fn~\w+] = (keyPath: string) =>: string {
  return valueToString(getDefaultConfigValue(keyPath));
}

export const :[fn~\w+] = (type: string, value: any) =>: any {
  let result = value;
  if (value === '') {
    result = undefined;
  } else if (type === 'number') {
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      result = floatValue;
    }
  } else if (type === 'array') {
    const arrayValue = (value ? value : '').split(',');
    result = arrayValue.filter(item => Boolean(item)).map(item => item.trim());
  }
  return result;
}

export const :[fn~\w+] = (value: any) =>: string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value != null ? value.toString() : '';
  }
}
