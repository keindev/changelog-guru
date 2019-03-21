import * as semver from 'semver';
import { ReposListCommitsResponseItem } from '@octokit/rest';
import Commit from './entities/commit';
import Author from './entities/author';
import Process from './utils/process';

export default class State {
    private _version: string = '1.0.0';
    private commits: Commit[] = [];
    private authors: { [id: number]: Author } = {};
    private types: string[] = [];

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

    public addCommit(response: ReposListCommitsResponseItem): void {
        const { author, html_url: url } = response;
        const commit = new Commit(response.commit, url);

        commit.parse();

        if (!this.authors[author.id]) {
            this.authors[author.id] = new Author(author.id, author.html_url, author.avatar_url);
        }

        this.authors[author.id].addCommit(commit);
        this.commits.push(commit);
    }
}
