/// <reference types="react" />
import { ResponsiveValue } from "@chakra-ui/styled-system";
import { HTMLChakraProps } from "../system";
interface CircularProgressOptions {
    /**
     * The size of the circular progress in CSS units
     */
    size?: ResponsiveValue<string | number>;
    /**
     * Maximum value defining 100% progress made (must be higher than 'min')
     * @default 100
     */
    max?: number;
    /**
     * Minimum value defining 'no progress' (must be lower than 'max')
     * @default 0
     */
    min?: number;
    /**
     * This defines the stroke width of the svg circle.
     * @default "10px"
     */
    thickness?: string | number;
    /**
     * Current progress (must be between min/max)
     */
    value?: number;
    /**
     * If `true`, the cap of the progress indicator will be rounded.
     *
     * @default false
     */
    capIsRound?: boolean;
    /**
     * The content of the circular progress bar. If passed, the content will be inside and centered in the progress bar.
     */
    children?: React.ReactNode;
    /**
     * The color name of the progress track. Use a color key in the theme object
     */
    trackColor?: string;
    /**
     * The color of the progress indicator. Use a color key in the theme object
     */
    color?: string;
    /**
     * The desired valueText to use in place of the value
     */
    valueText?: string;
    /**
     * A function that returns the desired valueText to use in place of the value
     */
    getValueText?(value: number, percent: number): string;
    /**
     * If `true`, the progress will be indeterminate and the `value`
     * prop will be ignored
     *
     * @default false
     */
    isIndeterminate?: boolean;
}
export interface CircularProgressProps extends Omit<HTMLChakraProps<"div">, "color">, CircularProgressOptions {
}
/**
 * CircularProgress is used to indicate the progress of an activity.
 * It is built using `svg` and `circle` components with support for
 * theming and `indeterminate` state
 *
 * @see Docs https://chakra-ui.com/circularprogress
 * @todo add theming support for circular progress
 */
export declare const CircularProgress: import("../system").ComponentWithAs<"div", CircularProgressProps>;
export {};
