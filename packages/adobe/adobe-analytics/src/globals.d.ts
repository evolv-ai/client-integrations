export {};

declare global {
    interface Window {
        s: (...args: unknown[]) => void;
        evolv: any;
        evolvPreload: any;
    }
}
