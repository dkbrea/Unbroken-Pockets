/// <reference types="react" />
import { SystemProps } from "@chakra-ui/styled-system";
import { HTMLChakraProps } from "../system";
import type { StackDirection } from "./stack.utils";
export type { StackDirection };
interface StackOptions {
    /**
     * Shorthand for `alignItems` style prop
     * @type SystemProps["alignItems"]
     */
    align?: SystemProps["alignItems"];
    /**
     * Shorthand for `justifyContent` style prop
     * @type SystemProps["justifyContent"]
     */
    justify?: SystemProps["justifyContent"];
    /**
     * Shorthand for `flexWrap` style prop
     * @type SystemProps["flexWrap"]
     */
    wrap?: SystemProps["flexWrap"];
    /**
     * The space between each stack item
     * @type SystemProps["margin"]
     * @default "0.5rem"
     */
    spacing?: SystemProps["margin"];
    /**
     * The direction to stack the items.
     * @default "column"
     */
    direction?: StackDirection;
    /**
     * If `true`, each stack item will show a divider
     * @type React.ReactElement
     */
    divider?: React.ReactElement;
    /**
     * If `true`, the children will be wrapped in a `Box` with
     * `display: inline-block`, and the `Box` will take the spacing props
     *
     * @default false
     */
    shouldWrapChildren?: boolean;
    /**
     * If `true` the items will be stacked horizontally.
     *
     * @default false
     *
     * @deprecated - Use `direction="row"` or `HStack` instead
     */
    isInline?: boolean;
}
export interface StackProps extends HTMLChakraProps<"div">, StackOptions {
}
/**
 * Stacks help you easily create flexible and automatically distributed layouts
 *
 * You can stack elements in the horizontal or vertical direction,
 * and apply a space or/and divider between each element.
 *
 * It uses `display: flex` internally and renders a `div`.
 *
 * @see Docs https://chakra-ui.com/stack
 *
 */
export declare const Stack: import("../system").ComponentWithAs<"div", StackProps>;
