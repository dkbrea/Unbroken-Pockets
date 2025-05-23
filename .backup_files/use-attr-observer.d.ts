/// <reference types="react" />
export declare function useAttributeObserver(ref: React.RefObject<HTMLElement | null>, attributes: string | string[], fn: (v: MutationRecord) => void, enabled: boolean): void;
