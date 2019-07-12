export interface AuthorOptions {
    login: string;
    url: string;
    avatar: string;
}

export default class Author {
    public static AVATAR_SIZE = 40;
    public static SIZE_PARAMETER_NAME = 'size';
    public static NAME_PREFIX = '@';

    public readonly id: number;
    public readonly login: string;
    public readonly url: string;

    private avatar: string;
    private ignored = false;
    private contribution = 0;

    public constructor(id: number, options: AuthorOptions) {
        this.id = id;
        this.url = options.url;
        this.login = options.login;
        this.avatar = options.avatar;

        this.increaseContribution();
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

    public getContribution(): number {
        return this.contribution;
    }

    public getName(): string {
        return `${Author.NAME_PREFIX}${this.login}`;
    }

    public isIgnored(): boolean {
        return this.ignored;
    }

    public increaseContribution(): void {
        this.contribution++;
    }

    public ignore(): void {
        this.ignored = true;
    }
}
