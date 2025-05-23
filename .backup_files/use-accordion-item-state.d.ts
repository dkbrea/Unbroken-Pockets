/**
 * React hook to get the state and actions of an accordion item
 */
export declare function useAccordionItemState(): {
    isOpen: boolean;
    onClose: () => void;
    isDisabled: boolean | undefined;
    onOpen: () => void;
};
