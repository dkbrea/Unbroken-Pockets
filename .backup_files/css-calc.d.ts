import { CSSVar } from "./css-var";
export type Operand = string | number | CSSVar;
type Operands = Operand[];
export interface CalcChain {
    add: (...operands: Operands) => CalcChain;
    subtract: (...operands: Operands) => CalcChain;
    multiply: (...operands: Operands) => CalcChain;
    divide: (...operands: Operands) => CalcChain;
    negate: () => CalcChain;
    toString: () => string;
}
export declare const calc: ((x: Operand) => CalcChain) & {
    add: (...operands: Operands) => string;
    subtract: (...operands: Operands) => string;
    multiply: (...operands: Operands) => string;
    divide: (...operands: Operands) => string;
    negate: (x: Operand) => string;
};
export {};
