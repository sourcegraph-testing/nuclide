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
const :[fn~\w+] = (timeout) => {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(resolve, timeout);
        });
    });
}
exports.sleep = sleep;
class DeferredImpl {
    // tslint:disable-next-line:no-any
    constructor(scope = null) {
        this.scope = scope;
        this._resolved = false;
        this._rejected = false;
        // tslint:disable-next-line:promise-must-complete
        this._promise = new Promise((res, rej) => {
            this._resolve = res;
            this._reject = rej;
        });
    }
    resolve(value) {
        this._resolve.apply(this.scope ? this.scope : this, arguments);
        this._resolved = true;
    }
    // tslint:disable-next-line:no-any
    reject(reason) {
        this._reject.apply(this.scope ? this.scope : this, arguments);
        this._rejected = true;
    }
    get promise() {
        return this._promise;
    }
    get resolved() {
        return this._resolved;
    }
    get rejected() {
        return this._rejected;
    }
    get completed() {
        return this._rejected || this._resolved;
    }
}
// tslint:disable-next-line:no-any
const :[fn~\w+] = (scope = null) => {
    return new DeferredImpl(scope);
}
exports.createDeferred = createDeferred;
const :[fn~\w+] = (...promises) => {
    const deferred = createDeferred();
    Promise.all(promises)
        .then(deferred.resolve.bind(deferred))
        .catch(deferred.reject.bind(deferred));
    return deferred;
}
exports.createDeferredFrom = createDeferredFrom;
//# sourceMappingURL=async.js.map