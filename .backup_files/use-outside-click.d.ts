export interface UseOutsideClickProps {
    /**
     * Whether the hook is enabled
     */
    enabled?: boolean;
    /**
     * The reference to a DOM element.
     */
    ref: React.RefObject<HTMLElement | null>;
    /**
     * Function invoked when a click is triggered outside the referenced element.
     */
    handler?: (e: Event) => void;
}
/**
 * Example, used in components like Dialogs and Popovers, so they can close
 * when a user clicks outside them.
 */
export declare function useOutsideClick(props: UseOutsideClickProps): void;
