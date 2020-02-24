export default class License {
    readonly id: string;
    readonly prev?: string;
    readonly isChanged: boolean;

    constructor(id: string, prev?: string) {
        this.id = id;
        this.prev = prev;
        this.isChanged = !prev || !!id.localeCompare(prev);
    }
}
