import { GraphQLClient } from 'graphql-request';
import { TaskTree } from 'tasktree-cli';
import { Author } from '../../entities/author';
import { Commit } from '../../entities/commit';
import { Provider, ServiceProvider, Release } from '../provider';
import { ReleaseQuery } from './queries/release';
import { HistoryQuery, GitHubResponseHistoryCommit, GitHubResponseHistoryAuthor } from './queries/history';

const $tasks = TaskTree.tree();

export class GitHubProvider extends Provider {
    private endpoint = 'https://api.github.com/graphql';
    private authors: Map<number, Author> = new Map();
    private release: Release | undefined;
    private cursor: string | undefined;
    private releaseQuery: ReleaseQuery;
    private historyQuery: HistoryQuery;

    public constructor(url: string) {
        super(ServiceProvider.GitHub, url);

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
    }

    public async getCommits(date: string, pageIndex: number): Promise<[Commit, Author][]> {
        const task = $tasks.add(`Loading page #${pageIndex + 1}`);
        const release = await this.getLastRelease();
        let cursor: string | undefined;

        if (pageIndex) {
            cursor = await this.getCursor(pageIndex);
        }

        const commits = await this.historyQuery.getCommits(release.date, GitHubProvider.PAGE_SIZE, cursor);
        const pairs = commits.map((commit): [Commit, Author] => this.parseResponse(commit));

        task.complete(`Page #${pageIndex} loaded (${commits.length} commits)`);

        return pairs;
    }

    public async getLastRelease(): Promise<Release> {
        if (!this.release) {
            const response = await this.releaseQuery.getLast();

            this.release = response || {
                tag: undefined,
                date: new Date(0).toISOString(),
            };
        }

        return this.release;
    }

    private async getCursor(position: number): Promise<string | undefined> {
        if (!this.cursor) {
            this.cursor = await this.historyQuery.getCursor();
        }

        return this.cursor ? HistoryQuery.moveCursor(this.cursor, position * GitHubProvider.PAGE_SIZE - 1) : undefined;
    }

    private parseResponse(response: GitHubResponseHistoryCommit): [Commit, Author] {
        const author = this.parseAuthor(response.author);
        const commit = new Commit(response.hash, {
            header: response.header,
            body: response.body,
            timestamp: new Date(response.date).getTime(),
            author: author.login,
            url: response.url,
        });

        return [commit, author];
    }

    private parseAuthor(response: GitHubResponseHistoryAuthor): Author {
        const { authors } = this;
        const {
            avatar,
            user: { id, login, url },
        } = response;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, { login, url, avatar }));
        }

        return authors.get(id) as Author;
    }
}
