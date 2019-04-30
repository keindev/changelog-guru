import chalk from 'chalk';
import Octokit, {
    ReposListCommitsResponseItem,
    ReposListReleasesParams,
    ReposListCommitsResponseItemAuthor
} from '@octokit/rest';
import Provider from './provider';
import Process from '../utils/process';
import Author from '../entities/author';
import Commit from '../entities/commit';

const $process = Process.getInstance();

export default class GitHubProvider extends Provider {
    private kit: Octokit;
    private authors: Map<number, Author> = new Map();

    public constructor(url: string) {
        super(url);

        const task = $process.task('Initializing GitHub provider');

        if (!process.env.GITHUB_TOKEN) {
            task.fail('process.env.GITHUB_TOKEN - must be provided');
        }

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
        task.complete('GitHub provider initialized');
    }

    public async getCommits(date: string, page: number): Promise<[Commit, Author][]> {
        const task = $process.task(`Loading page #${page.toString()}`);

        const { data: commits } = await this.kit.repos.listCommits({
            page,
            since: date,
            repo: this.repository,
            owner: this.owner,
            sha: this.branch,
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            per_page: GitHubProvider.PAGE_SIZE
        });

        task.complete(`Page #${page.toString()} loaded (${chalk.bold(commits.length.toString())} commits)`);

        return commits.map(
            (response: ReposListCommitsResponseItem): [Commit, Author] => {
                const author = this.parseAuthor(response.author);
                const {
                    commit: {
                        message,
                        author: { date: timestamp }
                    },
                    html_url: url,
                    sha
                } = response;
                const commit = new Commit(sha, new Date(timestamp).getTime(), message, url, author.login);

                return [commit, author];
            }
        );
    }

    public async getLatestReleaseDate(): Promise<string> {
        const repository: ReposListReleasesParams = { repo: this.repository, owner: this.owner };
        // FIXME: get last release from list
        const {
            data: { length }
        } = await this.kit.repos.listReleases(repository);
        let date: string = new Date(0).toISOString();

        if (length) {
            // FIXME: get last release from list
            const { data: release } = await this.kit.repos.getLatestRelease(repository);

            date = release.created_at;
        }

        return date;
    }

    private parseAuthor(response: ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, login, url, avatar));
        }

        return authors.get(id) as Author;
    }
}
