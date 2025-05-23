/// <reference types="react" />
import { FormControlOptions } from "./form-control";
export interface UseFormControlProps<T extends HTMLElement> extends FormControlOptions {
    id?: string;
    onFocus?: React.FocusEventHandler<T>;
    onBlur?: React.FocusEventHandler<T>;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    "aria-describedby"?: string;
}
/**
 * React hook that provides the props that should be spread on to
 * input fields (`input`, `select`, `textarea`, etc.).
 *
 * It provides a convenient way to control a form fields, validation
 * and helper text.
 *
 * @internal
 */
export declare function useFormControl<T extends HTMLElement>(props: UseFormControlProps<T>): {
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    "aria-invalid": true | undefined;
    "aria-required": true | undefined;
    "aria-readonly": true | undefined;
    "aria-describedby": string | undefined;
    id: string;
    onFocus: (event: import("react").FocusEvent<T, Element>) => void;
    onBlur: (event: import("react").FocusEvent<T, Element>) => void;
};
/**
 * @internal
 */
export declare function useFormControlProps<T extends HTMLElement>(props: UseFormControlProps<T>): {
    "aria-describedby": string | undefined;
    id: string;
    isDisabled: boolean;
    isReadOnly: boolean;
    isRequired: boolean;
    isInvalid: boolean;
    onFocus: (event: import("react").FocusEvent<T, Element>) => void;
    onBlur: (event: import("react").FocusEvent<T, Element>) => void;
};
