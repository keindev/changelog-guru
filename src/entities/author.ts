import urlParse from 'url-parse';
import Process from '../utils/process';

const debug = Process.getDebugger('entities:author');

export default class Author {
    public static AVATAR_SIZE: number = 40;
    public readonly login: string;

    private id: number;
    private url: string;
    private avatar: string;
    private contribution: number = 0;
    private bonus: number = 0;

    public constructor(id: number, login: string, url: string, avatarUrl: string) {
        debug('create [Author]: %s', login);

        const avatar = urlParse(avatarUrl, true);

        if (avatar.query) avatar.query.size = Author.AVATAR_SIZE.toString();

        this.id = id;
        this.url = url;
        this.avatar = avatar.toString();
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
