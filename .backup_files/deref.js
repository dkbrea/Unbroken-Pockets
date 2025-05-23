"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDereferenceError = void 0;
exports.Deref = Deref;
const index_1 = require("../../type/error/index");
const index_2 = require("../../type/symbols/index");
class TypeDereferenceError extends index_1.TypeBoxError {
    constructor(schema) {
        super(`Unable to dereference schema with $id '${schema.$id}'`);
        this.schema = schema;
    }
}
exports.TypeDereferenceError = TypeDereferenceError;
function Resolve(schema, references) {
    const target = references.find((target) => target.$id === schema.$ref);
    if (target === undefined)
        throw new TypeDereferenceError(schema);
    return Deref(target, references);
}
/** Dereferences a schema from the references array or throws if not found */
function Deref(schema, references) {
    // prettier-ignore
    return (schema[index_2.Kind] === 'This' || schema[index_2.Kind] === 'Ref')
        ? Resolve(schema, references)
        : schema;
}
