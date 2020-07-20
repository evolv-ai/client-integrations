declare global {
    interface Window {
        ga: Function;
        evolvPreload: any;
        GoogleAnalyticsObject?: string;
    }
}
