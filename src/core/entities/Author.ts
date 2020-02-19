import Entity, { Priority } from './Entity';

export default class Author extends Entity {
    static DEFAULT_CONTRIBUTION = 1;
    static AVATAR_SIZE = 40;
    static SIZE_PARAMETER_NAME = 'size';
    static NAME_PREFIX = '@';

    readonly url: string;
    readonly login: string;

    private avatar: string;
    private contribution: number;

    constructor(login: string, url: string, avatar: string) {
        super(`${Author.NAME_PREFIX}${login}`);

        this.login = login;
        this.url = url;
        this.avatar = avatar;
        this.contribution = Author.DEFAULT_CONTRIBUTION;
    }

    get priority(): Priority {
        return this.contribution;
    }

    getAvatar(size: number = Author.AVATAR_SIZE): string {
        const url = new URL(this.avatar);
        const { searchParams } = url;

        if (searchParams.has(Author.SIZE_PARAMETER_NAME)) {
            searchParams.set(Author.SIZE_PARAMETER_NAME, size.toString());
        } else {
            searchParams.append(Author.SIZE_PARAMETER_NAME, size.toString());
        }

        return url.toString();
    }

    contribute(contribution?: number): void {
        this.contribution += contribution || Author.DEFAULT_CONTRIBUTION;
    }
}
