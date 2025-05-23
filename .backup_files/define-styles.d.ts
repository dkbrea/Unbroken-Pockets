import { SystemStyleObject } from "./system.types";
type Dict<T = any> = {
    [key: string]: T;
};
export type StyleFunctionProps = {
    colorScheme: string;
    colorMode: "light" | "dark";
    orientation?: "horizontal" | "vertical";
    theme: Dict;
    [key: string]: any;
};
export type SystemStyleFunction = (props: StyleFunctionProps) => SystemStyleObject;
export type SystemStyleInterpolation = SystemStyleObject | SystemStyleFunction;
export declare function defineStyle<T extends SystemStyleInterpolation>(styles: T): T;
type DefaultProps = {
    size?: string;
    variant?: string;
    colorScheme?: string;
};
export type StyleConfig = {
    baseStyle?: SystemStyleInterpolation;
    sizes?: {
        [size: string]: SystemStyleInterpolation;
    };
    variants?: {
        [variant: string]: SystemStyleInterpolation;
    };
    defaultProps?: DefaultProps;
};
/**
 * Defines the style config for a single-part component.
 */
export declare function defineStyleConfig<BaseStyle extends SystemStyleInterpolation, Sizes extends Dict<SystemStyleInterpolation>, Variants extends Dict<SystemStyleInterpolation>>(config: {
    baseStyle?: BaseStyle;
    sizes?: Sizes;
    variants?: Variants;
    defaultProps?: {
        size?: keyof Sizes;
        variant?: keyof Variants;
        colorScheme?: string;
    };
}): {
    baseStyle?: BaseStyle | undefined;
    sizes?: Sizes | undefined;
    variants?: Variants | undefined;
    defaultProps?: {
        size?: keyof Sizes | undefined;
        variant?: keyof Variants | undefined;
        colorScheme?: string | undefined;
    } | undefined;
};
type Anatomy = {
    keys: string[];
};
export type PartsStyleObject<Parts extends Anatomy = Anatomy> = Partial<Record<Parts["keys"][number], SystemStyleObject>>;
export type PartsStyleFunction<Parts extends Anatomy = Anatomy> = (props: StyleFunctionProps) => PartsStyleObject<Parts>;
export type PartsStyleInterpolation<Parts extends Anatomy = Anatomy> = PartsStyleObject<Parts> | PartsStyleFunction<Parts>;
export interface MultiStyleConfig<Parts extends Anatomy = Anatomy> {
    parts: Parts["keys"];
    baseStyle?: PartsStyleInterpolation<Parts>;
    sizes?: {
        [size: string]: PartsStyleInterpolation<Parts>;
    };
    variants?: {
        [variant: string]: PartsStyleInterpolation<Parts>;
    };
    defaultProps?: DefaultProps;
}
/**
 * Returns an object of helpers that can be used to define
 * the style configuration for a multi-part component.
 */
export declare function createMultiStyleConfigHelpers<Part extends string>(parts: Part[] | Readonly<Part[]>): {
    definePartsStyle<PartStyles extends PartsStyleInterpolation<{
        keys: Part[];
    }>>(config: PartStyles): PartStyles;
    defineMultiStyleConfig<BaseStyle extends PartsStyleInterpolation<{
        keys: Part[];
    }>, Sizes extends Dict<PartsStyleInterpolation<{
        keys: Part[];
    }>>, Variants extends Dict<PartsStyleInterpolation<{
        keys: Part[];
    }>>>(config: {
        baseStyle?: BaseStyle | undefined;
        sizes?: Sizes | undefined;
        variants?: Variants | undefined;
        defaultProps?: {
            size?: keyof Sizes | undefined;
            variant?: keyof Variants | undefined;
            colorScheme?: string | undefined;
        } | undefined;
    }): {
        baseStyle?: BaseStyle | undefined;
        sizes?: Sizes | undefined;
        variants?: Variants | undefined;
        defaultProps?: {
            size?: keyof Sizes | undefined;
            variant?: keyof Variants | undefined;
            colorScheme?: string | undefined;
        } | undefined;
        parts: Part[];
    };
};
export {};
