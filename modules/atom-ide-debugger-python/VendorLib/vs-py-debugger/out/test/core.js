// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        const :[fn~\w+] = (value) => { try { step(generator.next(value)); } catch (e) { reject(e); } }
        const :[fn~\w+] = (value) => { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        const :[fn~\w+] = (result) => { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// File without any dependencies on VS Code.
const :[fn~\w+] = (milliseconds) => {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    });
}
exports.sleep = sleep;
//# sourceMappingURL=core.js.map