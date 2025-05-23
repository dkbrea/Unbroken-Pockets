/// <reference types="react" />
import type { ToastPosition } from "./toast.placement";
import type { ToastId, ToastOptions, ToastState } from "./toast.types";
/**
 * Given an array of toasts for a specific position.
 * It returns the toast that matches the `id` passed
 */
export declare const findById: (arr: ToastOptions[], id: ToastId) => ToastOptions | undefined;
/**
 * Given the toast manager state, finds the toast that matches
 * the id and return its position and index
 */
export declare function findToast(toasts: ToastState, id: ToastId): {
    position: ToastPosition | undefined;
    index: number;
};
/**
 * Given the toast manager state, finds the position of the toast that
 * matches the `id`
 */
export declare function getToastPosition(toasts: ToastState, id: ToastId): ToastPosition | undefined;
/**
 * Given the toast manager state, checks if a specific toast is
 * still in the state, which means it is still visible on screen.
 */
export declare const isVisible: (toasts: ToastState, id: ToastId) => boolean;
/**
 * Gets the styles to be applied to a toast's container
 * based on its position in the manager
 */
export declare function getToastStyle(position: ToastPosition): React.CSSProperties;
/**
 * Compute the style of a toast based on its position
 */
export declare function getToastListStyle(position: ToastPosition): React.CSSProperties;
