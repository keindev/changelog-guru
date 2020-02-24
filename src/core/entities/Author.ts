import Entity, { Priority } from './Entity';

const resize = (avatar: string, size = 40): string => {
    const url = new URL(avatar);

    url.searchParams.delete('s');
    url.searchParams.append('s', `${size}`);

    return `${url}`;
}

export default class Author extends Entity {
    readonly url: string;
    readonly avatar: string;

    #priority = 0;

    constructor(name: string, url: string, avatar: string) {
        super(`@${name}`);

        this.url = url;
        this.avatar = resize(avatar);
    }

    get shortName(): string {
        return this.name;
    }

    get priority(): Priority | number {
        return this.#priority;
    }

    contribute(value = 1): void {
        if (value > 0) this.#priority += value;
    }
}
