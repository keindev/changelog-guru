import { Priority } from '../typings/enums';
import { Entity } from './entity';

export interface AuthorOptions {
    url: string;
    avatar: string;
}

export class Author extends Entity {
    public static DEFAULT_CONTRIBUTION = 1;
    public static AVATAR_SIZE = 40;
    public static SIZE_PARAMETER_NAME = 'size';
    public static NAME_PREFIX = '@';

    public readonly url: string;
    public readonly login: string;

    private avatar: string;
    private contribution: number;

    public constructor(login: string, options: AuthorOptions) {
        super(`${Author.NAME_PREFIX}${login}`);

        this.login = login;
        this.url = options.url;
        this.avatar = options.avatar;
        this.contribution = Author.DEFAULT_CONTRIBUTION;
    }

    public getPriority(): Priority {
        return this.contribution;
    }

    public getAvatar(size: number = Author.AVATAR_SIZE): string {
        const url = new URL(this.avatar);
        const { searchParams } = url;

        if (searchParams.has(Author.SIZE_PARAMETER_NAME)) {
            searchParams.set(Author.SIZE_PARAMETER_NAME, size.toString());
        } else {
            searchParams.append(Author.SIZE_PARAMETER_NAME, size.toString());
        }

        return url.toString();
    }

    public increaseContribution(contribution?: number): void {
        this.contribution += contribution || Author.DEFAULT_CONTRIBUTION;
    }
}
