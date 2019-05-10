export default class Author {
    public static DEFAULT_AVATAR_SIZE: number = 40;

    public readonly id: number;
    public readonly login: string;
    public readonly url: string;

    private avatar: string;
    private contribution: number;

    public constructor(id: number, login: string, url: string, avatar: string) {
        this.id = id;
        this.url = url;
        this.login = login;
        this.avatar = avatar;
        this.contribution = 1;
    }

    public getAvatar(size: number = Author.DEFAULT_AVATAR_SIZE): string {
        const url = new URL(this.avatar);
        const { searchParams } = url;
        const name = 'size';

        if (searchParams.has(name)) {
            searchParams.set(name, size.toString());
        } else {
            searchParams.append(name, size.toString());
        }

        return url.toString();
    }

    public increaseContribution(): void {
        this.contribution++;
    }

    public getContribution(): number {
        return this.contribution;
    }

    public toString(): string {
        return `@${this.login}`;
    }
}
