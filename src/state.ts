import * as semver from 'semver';
import { ReposListCommitsResponseItem } from '@octokit/rest';
import Section from './entities/section';
import Commit from './entities/commit';
import Author from './entities/author';
import Process from './utils/process';

export interface Options {
    stats?: boolean;
}

export default class State implements Options {
    private _version: string = '1.0.0';
    private _stats: boolean = false;
    private commits: Commit[] = [];
    private authors: { [id: number]: Author } = {};
    private sections: Section[] = [];
    private patterns: Pattern[] = []

    public set version(version: string) {
        if (!semver.valid(version)) Process.error('<package.version> is invalid (see https://semver.org/)');

        this._version = version;
    }

    public get version(): string {
        return this._version;
    }

    public set stats(value: boolean | undefined) {
        if (typeof value === 'boolean') this._stats = value;
    }

    public addSection(name: string, patterns: string[]): void {
        this.sections.push(new Section(name, patterns));
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
