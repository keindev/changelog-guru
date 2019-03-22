import * as semver from 'semver';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Process from '../utils/process';

export default class State {
    private _version: string = '1.0.0';
    private commits: Commit[] = [];
    private types: string[] = [];
    private authors: { [key: number]: Author } = {};

    public set version(version: string) {
        if (!semver.valid(version)) Process.error('<version> is invalid (see https://semver.org/)');

        this._version = version;
    }

    public get version(): string {
        return this._version;
    }

    public addType(type: string) {
        if (typeof type !== 'string' || !type) Process.error(`incorrect or empty commit type name - "${type}"`);
        if (this.types.indexOf(type) >= 0) Process.error(`commit type name is defined twice - ${type}`);

        this.types.push(type);
    }

    public addAutor(id: number, url: string, avatarUrl: string): Author {
        const { authors } = this;

        if (!authors[id]) {
            authors[id] = new Author(id, url, avatarUrl);
        }

        return authors[id];
    }

    public addCommit(commit: Commit) {
        commit.parse();
        this.commits.push(commit);
    }
}
