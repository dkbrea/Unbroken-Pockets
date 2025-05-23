import { Union } from '../union/index.mjs';
import { ExtendsCheck, ExtendsResult } from './extends-check.mjs';
import { CloneType } from '../clone/type.mjs';
import { ExtendsFromMappedKey } from './extends-from-mapped-key.mjs';
import { ExtendsFromMappedResult } from './extends-from-mapped-result.mjs';
// ------------------------------------------------------------------
// TypeGuard
// ------------------------------------------------------------------
import { IsMappedKey, IsMappedResult } from '../guard/kind.mjs';
// prettier-ignore
function ExtendsResolve(left, right, trueType, falseType) {
    const R = ExtendsCheck(left, right);
    return (R === ExtendsResult.Union ? Union([trueType, falseType]) :
        R === ExtendsResult.True ? trueType :
            falseType);
}
/** `[Json]` Creates a Conditional type */
export function Extends(L, R, T, F, options = {}) {
    // prettier-ignore
    return (IsMappedResult(L) ? ExtendsFromMappedResult(L, R, T, F, options) :
        IsMappedKey(L) ? CloneType(ExtendsFromMappedKey(L, R, T, F, options)) :
            CloneType(ExtendsResolve(L, R, T, F), options));
}
