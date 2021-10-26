export function arrayFromNodeList(input: NodeList): HTMLElement[] {
    if (!input || input.length < 1) {
        return [];
    }

    return Array.prototype.slice.call(input);
}
