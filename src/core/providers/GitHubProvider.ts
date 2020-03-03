import { GitHubProvider as Provider } from 'gh-gql';
import { GitHubResponseCommit, GitHubResponseCommitAuthor } from 'gh-gql/lib/queries/commit';
import { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import Author from '../entities/Author';
import Commit from '../entities/Commit';
import GitProvider from './GitProvider';
import { IReleaseInfo, ServiceProvider } from './Provider';

export default class GitHubProvider extends GitProvider {
    private provider: Provider;
    private authors = new Map<number, Author>();
    private release: IReleaseInfo | undefined;

    constructor(url: string, branch?: string) {
        super(ServiceProvider.GitHub, url, branch);

        this.provider = new Provider({ owner: this.owner, repository: this.repository, branch: this.branch });
    }

    async getCommits(date: Date, pageIndex: number): Promise<Commit[]> {
        const commits = await this.provider.commit.getList(date, pageIndex);

        return commits.map(this.parseCommit.bind(this));
    }

    async getCommitsCount(date: Date): Promise<number> {
        const count = await this.provider.commit.getCount(date);

        return count;
    }

    async getLastRelease(): Promise<IReleaseInfo> {
        if (!this.release) {
            const response = await this.provider.release.getLast();

            this.release = { tag: response?.tag, date: new Date(response?.date ?? 0) };
        }

        return this.release as IReleaseInfo;
    }

    async getPrevPackage(): Promise<PackageJson> {
        const task = TaskTree.add(`Loading previous release {bold package.json} state...`);
        const release = await this.getLastRelease();
        const change = await this.provider.package.getLastChange(release.date);
        let data: PackageJson = {};

        if (change) {
            data = await this.provider.package.getContent(change);

            task.complete('Previous release {bold package.json} state loaded');
        } else {
            task.skip('The previous release did not contain package.json');
        }

        return data;
    }

    private parseCommit({ author, date, ...others }: GitHubResponseCommit): Commit {
        return new Commit({ ...others, author: this.parseAuthor(author), timestamp: new Date(date).getTime() });
    }

    private parseAuthor({ avatar, user: { id, login, url } }: GitHubResponseCommitAuthor): Author {
        const { authors } = this;

        if (!authors.has(id)) authors.set(id, new Author(login, url, avatar));

        return authors.get(id) as Author;
    }
}
