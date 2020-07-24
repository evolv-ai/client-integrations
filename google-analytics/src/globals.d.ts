export {};

declare global {
    interface Window {
        ga: Function;
        evolv: any;
        evolvPreload: any;
        GoogleAnalyticsObject?: string;
    }
}
