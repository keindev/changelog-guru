import Entity, { Priority } from './Entity';

export default class Author extends Entity {
    readonly url: string;
    readonly avatar: string;

    #priority = 0;

    constructor(name: string, url: string, avatar: string) {
        super(`@${name}`);

        const avatarUrl = new URL(avatar);

        avatarUrl.searchParams.delete('s');
        avatarUrl.searchParams.append('s', `${40}`);
        this.url = url;
        this.avatar = `${url}`;
    }

    get priority(): Priority | number {
        return this.#priority;
    }

    contribute(value = 1): void {
        if (value > 0) this.#priority += value;
    }
}
