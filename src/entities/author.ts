import Commit from './commit';

export default class Author {
    private id: number;
    private url: string;
    private avatar: string;
    private commits: Commit[] = [];

    public constructor(id: number, url: string, avatar: string) {
        this.id = id;
        this.url = url;
        this.avatar = avatar;
    }

    public addCommit(commit: Commit): void {
        this.commits.push(commit);
    }
}
