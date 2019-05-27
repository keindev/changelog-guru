export interface AuthorOptions {
    login: string;
    url: string;
    avatar: string;
}

export default class Author {
    public static DEFAULT_AVATAR_SIZE = 40;
    public static DEFAULT_CONTRIBUTION = 1;
    public static URL_SIZE_PARAMETER_NAME = 'size';
    public static NAME_PREFIX = '@';

    public readonly id: number;
    public readonly login: string;
    public readonly url: string;

    private avatar: string;
    private contribution: number;

    public constructor(id: number, options: AuthorOptions) {
        this.id = id;
        this.url = options.url;
        this.login = options.login;
        this.avatar = options.avatar;
        this.contribution = Author.DEFAULT_CONTRIBUTION;
    }

    public getAvatar(size: number = Author.DEFAULT_AVATAR_SIZE): string {
        const url = new URL(this.avatar);
        const { searchParams } = url;

        if (searchParams.has(Author.URL_SIZE_PARAMETER_NAME)) {
            searchParams.set(Author.URL_SIZE_PARAMETER_NAME, size.toString());
        } else {
            searchParams.append(Author.URL_SIZE_PARAMETER_NAME, size.toString());
        }

        return url.toString();
    }

    public getContribution(): number {
        return this.contribution;
    }

    public getName(): string {
        return `${Author.NAME_PREFIX}${this.login}`;
    }

    public increaseContribution(): void {
        this.contribution++;
    }
}
