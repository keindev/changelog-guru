import * as semver from 'semver';
import { ReposListCommitsResponseItem } from '@octokit/rest';
import Section from './section';
import Process from './utils/process';

export interface Options {
    stats?: boolean;
}

export default class State implements Options {
    public static DEFALUT_VERSION = '1.0.0';

    private _version: string = State.DEFALUT_VERSION;
    private _stats: boolean = false;
    private commits: ReposListCommitsResponseItem[] = [];
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

    public addCommit(commit: ReposListCommitsResponseItem): void {
        this.commits.push(commit);
    }
}
