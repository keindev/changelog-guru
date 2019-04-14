import * as semver from 'semver';
import SectionManager from './managers/section-manager';
import CommitManager from './managers/commit-manager';
import Author from '../entities/author';
import Entity from '../entities/entity';
import Process from '../utils/process';

export default class State extends Entity {
    public readonly sections: SectionManager = new SectionManager();
    public readonly commits: CommitManager = new CommitManager();

    private version: string = '1.0.0';
    private types: string[] = [];
    private authors: Map<number, Author> = new Map();

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
}
