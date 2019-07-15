import Octokit from '@octokit/rest';
import { TaskTree } from 'tasktree-cli';
import { Provider, ServiceProvider } from './provider';
import Author from '../entities/author';
import Commit from '../entities/commit';

const $tasks = TaskTree.tree();

export default class GitHubProvider extends Provider {
    private kit: Octokit;
    private authors: Map<number, Author> = new Map();

    public constructor(url: string) {
        super(ServiceProvider.GitHub, url);

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
    }

    public async getCommits(date: string, page: number): Promise<[Commit, Author][]> {
        const task = $tasks.add(`Loading page #${page.toString()}`);
        const { data: commits } = await this.kit.repos.listCommits({
            page,
            since: date,
            repo: this.repository,
            owner: this.owner,
            sha: this.branch,
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            per_page: GitHubProvider.PAGE_SIZE,
        });

        task.complete(`Page #${page.toString()} loaded (${commits.length.toString()} commits)`);

        return commits.map((response): [Commit, Author] => this.parseResponse(response));
    }

    public async getLatestReleaseDate(): Promise<string> {
        const release = await this.getLatestRelease();

        return release ? release.published_at : new Date(0).toISOString();
    }

    public async getVersion(): Promise<string | undefined> {
        const release = await this.getLatestRelease();

        return release ? release.tag_name : undefined;
    }

    private async getLatestRelease(): Promise<Octokit.ReposGetLatestReleaseResponse | undefined> {
        const repository: Octokit.ReposListReleasesParams = { repo: this.repository, owner: this.owner };
        const { data: list } = await this.kit.repos.listReleases(repository);
        let release: Octokit.ReposGetLatestReleaseResponse | undefined;

        if (list.length) {
            const response = await this.kit.repos.getLatestRelease(repository);

            release = response.data;
        }

        return release;
    }

    private parseResponse(response: Octokit.ReposListCommitsResponseItem): [Commit, Author] {
        const author = this.parseAuthor(response.author);
        const commit = new Commit(response.sha, {
            timestamp: new Date(response.commit.author.date).getTime(),
            author: author.login,
            message: response.commit.message,
            url: response.html_url,
        });

        return [commit, author];
    }

    private parseAuthor(response: Octokit.ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, { login, url, avatar }));
        }

        return authors.get(id) as Author;
    }
}
