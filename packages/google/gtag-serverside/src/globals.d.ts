export {};

declare global {
    interface Window {
        dataLayer: any;
        ga: (...args: unknown[]) => void;
        gtag: (...args: unknown[]) => void;
        evolv: any;
        evolvPreload: any;
        GoogleAnalyticsObject?: string;
    }
}
