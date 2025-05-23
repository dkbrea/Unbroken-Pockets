import type { TSchema } from '../../type/schema/index.mjs';
import type { TRef } from '../../type/ref/index.mjs';
import type { TThis } from '../../type/recursive/index.mjs';
import { TypeBoxError } from '../../type/error/index.mjs';
export declare class TypeDereferenceError extends TypeBoxError {
    readonly schema: TRef | TThis;
    constructor(schema: TRef | TThis);
}
/** Dereferences a schema from the references array or throws if not found */
export declare function Deref(schema: TSchema, references: TSchema[]): TSchema;
