"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MappedKey = MappedKey;
const index_1 = require("../symbols/index");
// prettier-ignore
function MappedKey(T) {
    return {
        [index_1.Kind]: 'MappedKey',
        keys: T
    };
}
