import Octokit, { ReposListCommitsResponseItem, ReposListReleasesParams,
    ReposListCommitsResponseItemAuthor } from '@octokit/rest';
import Provider from './provider';
import Process from '../utils/process';
import Author from '../entities/author';
import Commit from '../entities/commit';

export default class GitHubProvider extends Provider {
    private kit: Octokit;
    private authors: Map<number, Author> = new Map();

    public constructor(url: string) {
        super(url);

        if (!process.env.GITHUB_TOKEN) Process.error('process.env.GITHUB_TOKEN - must be provided');

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
    }

    public async getCommits(page: number): Promise<[Commit, Author][]> {
        const since: string = await this.getLatestReleaseDate();

        Process.info('Get last commits since', since);
        Process.info('Repository', this.repository);
        Process.info('Owner', this.owner);
        Process.info('Brach', this.branch);

        const { data: commits } = await this.kit.repos.listCommits({
            page,
            since,
            repo: this.repository,
            owner: this.owner,
            sha: this.branch,
            'per_page': GitHubProvider.PAGE_SIZE
        });

        return commits.map((response: ReposListCommitsResponseItem): [Commit, Author] => {
            const author = this.parseAuthor(response.author);
            const { commit: { message, author: { date } }, html_url: url, sha } = response;
            const timestamp = new Date(date).getTime();
            const commit = new Commit(sha, timestamp, message, url, author.login);

            return [commit, author];
        });
    }

    private parseAuthor(response: ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, login, url, avatar));
        }

        return authors.get(id) as Author;
    }

    private async getLatestReleaseDate(): Promise<string> {
        const repository: ReposListReleasesParams = { repo: this.repository, owner: this.owner };
        // FIXME: get last release from list
        const { data: { length } } = await this.kit.repos.listReleases(repository);
        let since: string = (new Date(0)).toISOString();

        if (length) {
            // FIXME: get last release from list
            const { data: release } = await this.kit.repos.getLatestRelease(repository);

            since = release.created_at;
        }

        return since;
    }
}
