import { GitHubProvider as Provider } from 'gh-gql';
import { GitHubResponseCommit, GitHubResponseCommitAuthor } from 'gh-gql/lib/queries/commit';
import { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import { Author } from '../entities/author';
import { Commit } from '../entities/commit';
import { ServiceProvider } from '../config/config';
import { GitProvider } from './git-provider';
import { ReleaseInfo } from './provider';

export class GitHubProvider extends GitProvider {
    private provider: Provider;

    private authors: Map<number, Author> = new Map();
    private release: ReleaseInfo | undefined;

    public constructor(url: string, branch?: string) {
        super(ServiceProvider.GitHub, url, branch);

        this.provider = new Provider({
            owner: this.owner,
            repository: this.repository,
            branch: this.branch,
        });
    }

    public async getCommits(date: Date, pageIndex: number): Promise<Commit[]> {
        const commits = await this.provider.commit.getList(date, pageIndex);

        return commits.map(this.parseCommit.bind(this));
    }

    public async getCommitsCount(date: Date): Promise<number> {
        const count = await this.provider.commit.getCount(date);

        return count;
    }

    public async getLastRelease(): Promise<ReleaseInfo> {
        if (!this.release) {
            const response = await this.provider.release.getLast();

            if (response) {
                this.release = { tag: response.tag, date: new Date(response.date) };
            } else {
                this.release = { tag: undefined, date: new Date(0) };
            }
        }

        return this.release as ReleaseInfo;
    }

    public async getPrevPackage(): Promise<PackageJson> {
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

    private parseCommit({ author, hash, header, body, date, url }: GitHubResponseCommit): Commit {
        const commit = new Commit({
            hash,
            header,
            body,
            url,
            author: this.parseAuthor(author),
            timestamp: new Date(date).getTime(),
        });

        return commit;
    }

    private parseAuthor({ avatar, user: { id, login, url } }: GitHubResponseCommitAuthor): Author {
        const { authors } = this;

        if (!authors.has(id)) authors.set(id, new Author({ login, url, avatar }));

        return authors.get(id) as Author;
    }
}
