import * as semver from 'semver';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Section from '../entities/section';
import Process from '../utils/process';
import Entity from '../entities/entity';

export default class State extends Entity {
    private version: string = '1.0.0';
    private types: string[] = [];
    private commits: Map<string, Commit> = new Map();
    private authors: Map<number, Author> = new Map();
    private sections: Map<string, Section> = new Map();

    public setVersion(version: string): void {
        if (!semver.valid(version)) Process.error('<version> is invalid (see https://semver.org/)');

        this.debug('set version: %s', version);
        this.version = version;
    }

    public getVersion(): string {
        return this.version;
    }

    public addType(type: string): void {
        if (typeof type !== 'string' || !type) Process.error(`incorrect or empty commit type name - "${type}"`);
        if (this.types.indexOf(type) >= 0) Process.error(`commit type name is defined twice - ${type}`);

        this.debug('add type: %s', type);
        this.types.push(type);
    }

    public addAutor(id: number, login: string, url: string, avatarUrl: string): Author {
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, login, url, avatarUrl));
        }

        return authors.get(id) as Author;
    }

    public addCommit(commit: Commit): void {
        if (commit.isValid() && !this.commits.has(commit.sha)) {
            this.commits.set(commit.sha, commit);
        } else {
            Process.warn(`invalid commit: ${commit.sha}`);
            this.debug('invalid: %O', commit);
        }
    }

    public removeCommit(commit: Commit, force: boolean = false): void {
        if (!commit.isImportant() || force) {
            this.debug('remove: %s', commit.sha);
            this.commits.delete(commit.sha);
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
