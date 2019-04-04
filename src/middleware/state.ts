import * as semver from 'semver';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Section from '../entities/section';
import Process from '../utils/process';

const debug = Process.getDebugger('middleware:state');

export default class State {
    private version: string = '1.0.0';
    private types: string[] = [];
    private commits: Map<number, Commit> = new Map();
    private authors: Map<number, Author> = new Map();
    private sections: Map<string, Section> = new Map();

    public setVersion(version: string): void {
        debug(`set package version: ${version}`);

        if (!semver.valid(version)) Process.error('<version> is invalid (see https://semver.org/)');

        this.version = version;
    }

    public getVersion(): string {
        return this.version;
    }

    public addType(type: string): void {
        debug(`add commit type: ${type}`);

        if (typeof type !== 'string' || !type) Process.error(`incorrect or empty commit type name - "${type}"`);
        if (this.types.indexOf(type) >= 0) Process.error(`commit type name is defined twice - ${type}`);

        this.types.push(type);
    }

    public addAutor(id: number, url: string, avatarUrl: string): Author {
        const { authors } = this;

        if (!authors.has(id)) {
            debug(`added author: ${url}`);

            authors.set(id, new Author(id, url, avatarUrl));
        }

        return authors.get(id) as Author;
    }

    public addCommit(commit: Commit): void {
        // TODO: replase timestamp to unique sha?!
        if (commit.isValid() && !this.commits.has(commit.timestamp)) {
            debug(`added commit: ${commit.url}`);

            this.commits.set(commit.timestamp, commit);
        } else {
            Process.warn(`invalid commit: ${commit.url}`);
            debug(`invalid commit: %j`, commit);
        }
    }

    public removeCommit(commit: Commit, force: boolean = false): void {
        if (!commit.isImportant() || force) {
            this.commits.delete(commit.timestamp);
        }
    }

    public group(name: string, commit: Commit): void {
        const { sections } = this;
        let section: Section;

        if (sections.has(name)) {
            section = sections.get(name) as Section;
        } else {
            section = new Section(name);
            sections.set(name, section);
        }

        section.assign(commit);
        this.removeCommit(commit);
    }

    public modify(callback: (commit: Commit) => void): void {
        this.commits.forEach((commit): void => {
            callback(commit);
        });
    }
}
