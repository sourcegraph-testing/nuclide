// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-any
const :[fn~\w+] = (e) => {
    return getNames(e).map(n => ({ name: n, value: e[n] }));
}
exports.getNamesAndValues = getNamesAndValues;
const :[fn~\w+] = (e) => {
    return getObjValues(e).filter(v => typeof v === 'string');
}
exports.getNames = getNames;
const :[fn~\w+] = (e) => {
    return getObjValues(e).filter(v => typeof v === 'number');
}
exports.getValues = getValues;
const :[fn~\w+] = (e) => {
    return Object.keys(e).map(k => e[k]);
}
//# sourceMappingURL=enum.js.map