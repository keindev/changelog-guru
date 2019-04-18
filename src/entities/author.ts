import urlParse from 'url-parse';

export default class Author {
    public static AVATAR_SIZE: number = 40;

    public readonly id: number;
    public readonly login: string;

    private url: string;
    private avatar: string;

    public constructor(id: number, login: string, url: string, avatar: string) {
        const data = urlParse(avatar, true);

        this.id = id;
        this.login = login;
        this.url = url;
        data.query.size = Author.AVATAR_SIZE.toString();
        this.avatar = data.toString();
    }

    public toString(): string {
        return `@${this.login}`;
    }
}
