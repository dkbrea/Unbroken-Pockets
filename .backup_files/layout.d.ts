import * as CSS from "csstype";
import { Config } from "../utils/prop-config";
import { Length, Token } from "../utils";
export declare const layout: Config;
/**
 * Types for layout related CSS properties
 */
export interface LayoutProps {
    /**
     * The CSS `display` property
     */
    display?: Token<CSS.Property.Display>;
    /**
     * Hides an element from the specified breakpoint and up
     */
    hideFrom?: Token<string & {}, "breakpoints">;
    /**
     * Hides an element below the specified breakpoint
     */
    hideBelow?: Token<string & {}, "breakpoints">;
    /**
     * The CSS `width` property
     */
    width?: Token<CSS.Property.Width | number, "sizes">;
    /**
     * The CSS `width` property
     */
    w?: Token<CSS.Property.Width | number, "sizes">;
    inlineSize?: Token<CSS.Property.InlineSize | number, "sizes">;
    /**
     * The CSS `width` and `height` property
     */
    boxSize?: Token<CSS.Property.Width | number, "sizes">;
    /**
     * The CSS `max-width` property
     */
    maxWidth?: Token<CSS.Property.MaxWidth | number, "sizes">;
    /**
     * The CSS `max-width` property
     */
    maxW?: Token<CSS.Property.MaxWidth | number, "sizes">;
    maxInlineSize?: Token<CSS.Property.MaxInlineSize | number, "sizes">;
    /**
     * The CSS `min-width` property
     */
    minWidth?: Token<CSS.Property.MinWidth | number, "sizes">;
    /**
     * The CSS `min-width` property
     */
    minW?: Token<CSS.Property.MinWidth | number, "sizes">;
    minInlineSize?: Token<CSS.Property.MinInlineSize | number, "sizes">;
    /**
     * The CSS `height` property
     */
    height?: Token<CSS.Property.Height | number, "sizes">;
    /**
     * The CSS `height` property
     */
    h?: Token<CSS.Property.Height | number, "sizes">;
    blockSize?: Token<CSS.Property.BlockSize | number, "sizes">;
    /**
     * The CSS `max-height` property
     */
    maxHeight?: Token<CSS.Property.MaxHeight | number, "sizes">;
    /**
     * The CSS `max-height` property
     */
    maxH?: Token<CSS.Property.MaxHeight | number, "sizes">;
    maxBlockSize?: Token<CSS.Property.MaxBlockSize | number, "sizes">;
    /**
     * The CSS `min-height` property
     */
    minHeight?: Token<CSS.Property.MinHeight | number, "sizes">;
    /**
     * The CSS `min-height` property
     */
    minH?: Token<CSS.Property.MinHeight | number, "sizes">;
    minBlockSize?: Token<CSS.Property.MinBlockSize | number, "sizes">;
    /**
     * The CSS `vertical-align` property
     */
    verticalAlign?: Token<CSS.Property.VerticalAlign<Length>>;
    /**
     * The CSS `overflow` property
     */
    overflow?: Token<CSS.Property.Overflow>;
    /**
     * The CSS `overflow-x` property
     */
    overflowX?: Token<CSS.Property.OverflowX>;
    /**
     * The CSS `overflow-y` property
     */
    overflowY?: Token<CSS.Property.OverflowY>;
    /**
     * The CSS `box-sizing` property
     */
    boxSizing?: CSS.Property.BoxSizing;
    /**
     * The CSS `box-decoration` property
     */
    boxDecorationBreak?: Token<CSS.Property.BoxDecorationBreak>;
    /**
     * The CSS `float` property
     */
    float?: Token<CSS.Property.Float>;
    /**
     * The CSS `object-fit` property
     */
    objectFit?: Token<CSS.Property.ObjectFit>;
    /**
     * The CSS `object-position` property
     */
    objectPosition?: Token<CSS.Property.ObjectPosition<Length>>;
    /**
     * The CSS `overscroll-behavior` property
     */
    overscrollBehavior?: Token<CSS.Property.OverscrollBehavior>;
    /**
     * The CSS `overscroll-behavior` property
     */
    overscroll?: Token<CSS.Property.OverscrollBehavior>;
    /**
     * The CSS `overscroll-behavior-x` property
     */
    overscrollBehaviorX?: Token<CSS.Property.OverscrollBehaviorX>;
    /**
     * The CSS `overscroll-behavior-x` property
     */
    overscrollX?: Token<CSS.Property.OverscrollBehaviorX>;
    /**
     * The CSS `overscroll-behavior-y` property
     */
    overscrollBehaviorY?: Token<CSS.Property.OverscrollBehaviorY>;
    /**
     * The CSS `overscroll-behavior-y` property
     */
    overscrollY?: Token<CSS.Property.OverscrollBehaviorY>;
    /**
     * The CSS `visibility` property
     */
    visibility?: Token<CSS.Property.Visibility>;
    /**
     * The CSS `isolation` property
     */
    isolation?: Token<CSS.Property.Isolation>;
    /**
     * The CSS `aspect-ratio` property
     */
    aspectRatio?: Token<CSS.Property.AspectRatio>;
}
