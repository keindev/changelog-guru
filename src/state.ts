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

    public addCommit(commitResponseItem: ReposListCommitsResponseItem): void {
        const { commit: { message, author: { date }, comment_count: count }, html_url: url } = commitResponseItem;
        const { author: { id: authorId, html_url: authorUrl, avatar_url: avatarUrl } } = commitResponseItem;
        const commit = new Commit(new Date(date).getTime(), message, url, count);

        if (!this.authors[authorId]) {
            this.authors[authorId] = new Author(authorId, authorUrl, avatarUrl);
        }

        this.authors[authorId].addCommit(commit);
        this.commits.push(commit);
    }
}
