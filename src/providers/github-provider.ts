import Octokit from '@octokit/rest';
import { TaskTree } from 'tasktree-cli';
import Provider from './provider';
import Author from '../entities/author';
import Commit from '../entities/commit';
import Version from '../utils/version';

const $tasks = TaskTree.tree();

export default class GitHubProvider extends Provider {
    private kit: Octokit;
    private authors: Map<number, Author> = new Map();

    public constructor(url: string) {
        super(url);

        const task = $tasks.add('Initializing GitHub provider');

        if (!process.env.GITHUB_TOKEN) {
            task.fail('process.env.GITHUB_TOKEN - must be provided');
        }

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
        task.complete('GitHub provider initialized');
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

        return commits.map((response): [Commit, Author] => {
            const author = this.parseAuthor(response.author);
            const {
                commit: {
                    message,
                    author: { date: timestamp },
                },
                html_url: url,
                sha,
            } = response;
            const commit = new Commit(sha, {
                timestamp: new Date(timestamp).getTime(),
                author: author.login,
                message,
                url,
            });

            return [commit, author];
        });
    }

    public async getLatestReleaseDate(): Promise<string> {
        const release = await this.getLatestRelease();

        return release ? release.published_at : new Date(0).toISOString();
    }

    public async getVersion(): Promise<string | undefined> {
        const release = await this.getLatestRelease();
        let version: string | undefined;

        if (release) version = Version.clear(release.tag_name);

        return version;
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

    private parseAuthor(response: Octokit.ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, { login, url, avatar }));
        }

        return authors.get(id) as Author;
    }
}
