export default class License {
    readonly curr: string;
    readonly prev?: string;
    readonly isChanged: boolean;

    constructor(curr: string, prev?: string) {
        this.curr = curr;
        this.prev = prev;
        this.isChanged = !prev || !!curr.localeCompare(prev);
    }
}
