export {};

declare global {
    interface Window {
        ga: (...args: unknown[]) => void;
        evolv: any;
        evolvPreload: any;
        GoogleAnalyticsObject?: string;
    }
}
