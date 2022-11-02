export {};

declare global {
    interface Window {
        ga: (...args: unknown[]) => void;
        gtag: (...args: unknown[]) => void;
        evolv: any;
        evolvPreload: any;
        GoogleAnalyticsObject?: string;
        dataLayer: any;
        google_tag_manager: any;
    }
}
