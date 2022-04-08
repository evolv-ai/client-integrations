export {};

interface dataLayer {
    [key: string]: any;
}

declare global {
    interface Window {
        analytics: any;
        evolv: any;
        evolvPreload: any;
        dataLayer?: dataLayer[];
    }
}
