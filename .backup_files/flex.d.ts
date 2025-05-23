import { SystemProps } from "@chakra-ui/styled-system";
import { HTMLChakraProps } from "../system";
export interface FlexOptions {
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
     * Shorthand for `flexDirection` style prop
     * @type SystemProps["flexDirection"]
     * @default "row"
     */
    direction?: SystemProps["flexDirection"];
    /**
     * Shorthand for `flexBasis` style prop
     * @type SystemProps["flexBasis"]
     */
    basis?: SystemProps["flexBasis"];
    /**
     * Shorthand for `flexGrow` style prop
     * @type SystemProps["flexGrow"]
     */
    grow?: SystemProps["flexGrow"];
    /**
     * Shorthand for `flexShrink` style prop
     * @type SystemProps["flexShrink"]
     */
    shrink?: SystemProps["flexShrink"];
}
export interface FlexProps extends HTMLChakraProps<"div">, FlexOptions {
}
/**
 * React component used to create flexbox layouts.
 *
 * It renders a `div` with `display: flex` and
 * comes with helpful style shorthand.
 *
 * @see Docs https://chakra-ui.com/flex
 */
export declare const Flex: import("../system").ComponentWithAs<"div", FlexProps>;
