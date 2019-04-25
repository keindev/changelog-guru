export default class Author {
    public static DEFAULT_AVATAR_SIZE: number = 40;

    public readonly id: number;
    public readonly login: string;
    public readonly url: string;

    private avatar: string;

    public constructor(id: number, login: string, url: string, avatar: string) {
        this.id = id;
        this.url = url;
        this.login = login;
        this.avatar = avatar;
    }

    public getAvatar(size: number = Author.DEFAULT_AVATAR_SIZE): string {
        const url = new URLSearchParams(this.avatar);
        const name = 'size';

        if (url.has(name)) {
            url.set(name, size.toString());
        } else {
            url.append(name, size.toString());
        }

        return url.toString();
    }

    public toString(): string {
        return `@${this.login}`;
    }
}
