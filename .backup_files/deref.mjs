import { TypeBoxError } from '../../type/error/index.mjs';
import { Kind } from '../../type/symbols/index.mjs';
export class TypeDereferenceError extends TypeBoxError {
    constructor(schema) {
        super(`Unable to dereference schema with $id '${schema.$id}'`);
        this.schema = schema;
    }
}
function Resolve(schema, references) {
    const target = references.find((target) => target.$id === schema.$ref);
    if (target === undefined)
        throw new TypeDereferenceError(schema);
    return Deref(target, references);
}
/** Dereferences a schema from the references array or throws if not found */
export function Deref(schema, references) {
    // prettier-ignore
    return (schema[Kind] === 'This' || schema[Kind] === 'Ref')
        ? Resolve(schema, references)
        : schema;
}
