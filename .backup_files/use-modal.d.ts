/// <reference types="react" />
import { PropGetter } from "@chakra-ui/utils";
export interface UseModalProps {
    /**
     * If `true`, the modal will be open.
     */
    isOpen: boolean;
    /**
     * The `id` of the modal
     */
    id?: string;
    /**
     * Callback invoked to close the modal.
     */
    onClose(): void;
    /**
     * If `true`, the modal will close when the overlay is clicked
     * @default true
     */
    closeOnOverlayClick?: boolean;
    /**
     * If `true`, the modal will close when the `Esc` key is pressed
     * @default true
     */
    closeOnEsc?: boolean;
    /**
     * Callback fired when the overlay is clicked.
     */
    onOverlayClick?(): void;
    /**
     * Callback fired when the escape key is pressed and focus is within modal
     */
    onEsc?(): void;
    /**
     * A11y: If `true`, the siblings of the `modal` will have `aria-hidden`
     * set to `true` so that screen readers can only see the `modal`.
     *
     * This is commonly known as making the other elements **inert**
     *
     * @default true
     */
    useInert?: boolean;
}
/**
 * Modal hook that manages all the logic for the modal dialog widget
 * and returns prop getters, state and actions.
 *
 * @param props
 */
export declare function useModal(props: UseModalProps): {
    isOpen: boolean;
    onClose: () => void;
    headerId: string;
    bodyId: string;
    setBodyMounted: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setHeaderMounted: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    dialogRef: import("react").MutableRefObject<HTMLElement | null>;
    overlayRef: import("react").MutableRefObject<HTMLElement | null>;
    getDialogProps: PropGetter;
    getDialogContainerProps: PropGetter;
    index: number;
};
export type UseModalReturn = ReturnType<typeof useModal>;
/**
 * Modal hook to polyfill `aria-modal`.
 *
 * It applies `aria-hidden` to elements behind the modal
 * to indicate that they're `inert`.
 *
 * @param ref React ref of the node
 * @param shouldHide whether `aria-hidden` should be applied
 */
export declare function useAriaHidden(ref: React.RefObject<HTMLElement | null>, shouldHide: boolean): void;
