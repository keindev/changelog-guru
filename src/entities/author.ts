import urlParse from 'url-parse';
import Entity from './entity';

export default class Author extends Entity {
    public static AVATAR_SIZE: number = 40;
    public readonly login: string;

    private id: number;
    private url: string;
    private avatar: string;
    private contribution: number = 0;
    private bonus: number = 0;

    public static resizeAvatar(url: string, size: number = Author.AVATAR_SIZE): string {
        const avatar = urlParse(url, true);

        if (avatar.query) {
            avatar.query.size = size.toString();
        }

        return avatar.toString();
    }

    public constructor(id: number, login: string, url: string, avatar: string) {
        super(login);

        this.id = id;
        this.url = url;
        this.avatar = Author.resizeAvatar(avatar);
        this.login = login;
    }

    public contribute(bonus?: number): void {
        if (bonus) {
            this.bonus += bonus;
        } else {
            this.contribution++;
        }
    }
}
