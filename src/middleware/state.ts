import * as semver from 'semver';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Section from '../entities/section';
import Process from '../utils/process';

export default class State {
    private version: string = '1.0.0';
    private types: string[] = [];
    private commits: Map<number, Commit> = new Map();
    private authors: Map<number, Author> = new Map();
    private sections: Map<string, Section> = new Map();

    public setVersion(version: string) {
        if (!semver.valid(version)) Process.error('<version> is invalid (see https://semver.org/)');

        this.version = version;
    }

    public getVersion(): string {
        return this.version;
    }

    public addType(type: string) {
        if (typeof type !== 'string' || !type) Process.error(`incorrect or empty commit type name - "${type}"`);
        if (this.types.indexOf(type) >= 0) Process.error(`commit type name is defined twice - ${type}`);

        this.types.push(type);
    }

    public addAutor(id: number, url: string, avatarUrl: string): Author {
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, url, avatarUrl));
        }

        return authors.get(id) as Author;
    }

    public addCommit(commit: Commit) {
        if (commit.isValid() && !this.commits.has(commit.timestamp)) {
            this.commits.set(commit.timestamp, commit);
        }
    }

    public removeCommit(commit: Commit, force: boolean = false) {
        if (!commit.isImportant() || force) {
            this.commits.delete(commit.timestamp);
        }
    }

    public group(name: string, commit: Commit) {
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

    public modify(callback: (commit: Commit) => void) {
        this.commits.forEach((commit) => {
            callback(commit);
        });
    }
}
