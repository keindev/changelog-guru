import { GraphQLClient } from 'graphql-request';
import { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import { Author } from '../../entities/author';
import { Commit } from '../../entities/commit';
import { ReleaseQuery } from './queries/release';
import { HistoryQuery } from './queries/history';
import { PackageQuery } from './queries/package';
import { GitProvider } from '../git-provider';
import { ReleaseInfo } from '../typings/types';
import { ServiceProvider } from '../../config/typings/enums';
import { GitHubResponseHistoryCommit, GitHubResponseHistoryAuthor } from './typings/types';

export class GitHubProvider extends GitProvider {
    private endpoint = 'https://api.github.com/graphql';
    private authors: Map<number, Author> = new Map();
    private release: ReleaseInfo | undefined;
    private cursor: string | undefined;
    private releaseQuery: ReleaseQuery;
    private historyQuery: HistoryQuery;
    private packageQuery: PackageQuery;

    public constructor(url: string, branch?: string) {
        super(ServiceProvider.GitHub, url, branch);

        const client = new GraphQLClient(this.endpoint, {
            method: 'POST',
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN || ''}`,
            },
        });
        const variables = {
            owner: this.owner,
            repository: this.repository,
            branch: this.branch,
        };

        this.releaseQuery = new ReleaseQuery(client, variables);
        this.historyQuery = new HistoryQuery(client, variables);
        this.packageQuery = new PackageQuery(client, variables);
    }

    public async getCommits(pageIndex: number): Promise<Commit[]> {
        const task = TaskTree.add(`Loading page #${pageIndex + 1}`);
        const release = await this.getLastRelease();
        let cursor: string | undefined;

        if (pageIndex) {
            cursor = await this.getCursor(pageIndex);
        }

        const commits = await this.historyQuery.getCommits(release.date, GitHubProvider.PAGE_SIZE, cursor);
        const list = commits.map((commit): Commit => this.parseResponse(commit));

        task.complete(`Page #${pageIndex + 1} loaded (${commits.length} commits)`);

        return list;
    }

    public async getLastRelease(): Promise<ReleaseInfo> {
        if (!this.release) {
            const response = await this.releaseQuery.getLast();

            this.release = response || {
                tag: undefined,
                date: new Date(0).toISOString(),
            };
        }

        return this.release as ReleaseInfo;
    }

    public async getPrevPackage(): Promise<PackageJson> {
        const task = TaskTree.add(`Loading previous package.json...`);
        const { packageQuery: query } = this;
        const release = await this.getLastRelease();
        const commit = await query.getPackageChanges(release.date);
        let data: PackageJson = {};

        if (commit) {
            data = await query.getPackageFrom(commit);
            task.complete('Previous package.json loaded');
        } else {
            task.skip('Previous package.json is not found');
        }

        return data;
    }

    private async getCursor(position: number): Promise<string | undefined> {
        if (!this.cursor) {
            this.cursor = await this.historyQuery.getCursor();
        }

        return this.cursor ? HistoryQuery.moveCursor(this.cursor, position * GitHubProvider.PAGE_SIZE - 1) : undefined;
    }

    private parseResponse(response: GitHubResponseHistoryCommit): Commit {
        const author = this.parseAuthor(response.author);
        const commit = new Commit(response.hash, {
            author,
            header: response.header,
            body: response.body,
            timestamp: new Date(response.date).getTime(),
            url: response.url,
        });

        return commit;
    }

    private parseAuthor(response: GitHubResponseHistoryAuthor): Author {
        const { authors } = this;
        const {
            avatar,
            user: { id, login, url },
        } = response;

        if (!authors.has(id)) {
            authors.set(id, new Author(login, { url, avatar }));
        }

        return authors.get(id) as Author;
    }
}
