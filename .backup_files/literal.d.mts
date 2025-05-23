import type { TSchema, SchemaOptions } from '../schema/index.mjs';
import { Kind } from '../symbols/index.mjs';
export type TLiteralValue = boolean | number | string;
export interface TLiteral<T extends TLiteralValue = TLiteralValue> extends TSchema {
    [Kind]: 'Literal';
    static: T;
    const: T;
}
/** `[Json]` Creates a Literal type */
export declare function Literal<T extends TLiteralValue>(value: T, options?: SchemaOptions): TLiteral<T>;
