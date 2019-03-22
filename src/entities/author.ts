import urlParse from 'url-parse';
import Commit from './commit';

export default class Author {
    public static AVATAR_SIZE: number = 40;

    private id: number;
    private url: string;
    private avatar: string;
    private contribution: number = 0;
    private bonus: number = 0;

    public constructor(id: number, url: string, avatarUrl: string) {
        let avatar = urlParse(avatarUrl, true);

        if (avatar.query) avatar.query.size = Author.AVATAR_SIZE.toString();

        this.id = id;
        this.url = url;
        this.avatar = avatar.toString();
    }

    public contribute(bonus?: number) {
        if (bonus) {
            this.bonus += bonus;
        } else {
            this.contribution++;
        }
    }
}
