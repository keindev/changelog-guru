export class License {
    public readonly id: string;
    public readonly prev: string | undefined;
    public readonly isChanged: boolean;

    public constructor(id: string, prev?: string) {
        this.id = id;
        this.prev = prev;
        this.isChanged = !prev || !!id.localeCompare(prev);
    }
}
