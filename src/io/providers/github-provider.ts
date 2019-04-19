import findupSync from 'findup-sync';
import fs from 'fs';
import Provider from './provider';
import Process from '../../utils/process';
import Author from '../../entities/author';
import Commit from '../../entities/commit';
import Octokit, { ReposListCommitsResponseItem, ReposListReleasesParams,
    ReposListCommitsResponseItemAuthor } from '@octokit/rest';

export default class GitHubProvider extends Provider {
    private authors: Map<number, Author> = new Map();
    private kit: Octokit;
    private sha: string = '';
    private lastReleaseDate: string = '';
    private repository: ReposListReleasesParams = { repo: '', owner: '' };

    public constructor() {
        super();

        if (!process.env.GITHUB_TOKEN) Process.error('process.env.GITHUB_TOKEN - must be provided');

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
    }

    public async init(repo: string, owner: string): Promise<void> {
        const pattern = `${GitHubProvider.EXTENSION}/HEAD`;
        const filepath = findupSync(pattern, { cwd: process.cwd() });

        if (fs.existsSync(filepath)) {
            const buffer: Buffer = fs.readFileSync(filepath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                [,this.sha] = match;
            } else {
                Process.error(`{bold ${pattern}} - ref(s) SHA not found`);
            }
        } else {
            Process.error(`{bold ${pattern}} - does not exist`);
        }

        this.repository.repo = repo;
        this.repository.owner = owner;
        this.lastReleaseDate = await this.getLatestReleaseDate();

        Process.info('Get last commits since', this.lastReleaseDate);
        Process.info('Repository', this.repository.repo);
        Process.info('Owner', this.repository.owner);
        Process.info('Brach', this.sha);
    }

    public async getCommits(page: number): Promise<Array<[Commit, Author][]>> {
        const { data: commits } = await this.kit.repos.listCommits({
            page,
            ...this.repository,
            sha: this.sha,
            since: this.lastReleaseDate,
            'per_page': GitHubProvider.COMMITS_PAGE_SIZE
        });

        return commits.map((response: ReposListCommitsResponseItem): [Commit, Author] => {
            const author = this.getAuthor(response.author);
            const commit = this.getCommit(response, author.login);

            return [commit, author];
        });
    }

    private getCommit(response: ReposListCommitsResponseItem, login: string): Commit {
        const { commit: { message, author }, html_url: url, sha } = response;
        const timestamp = new Date(author.date).getTime();
        const commit = new Commit(sha, timestamp, message, url, login);

        return commit;
    }

    private getAuthor(response: ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, login, url, avatar));
        }

        return authors.get(id) as Author;
    }

    private async getLatestReleaseDate(): Promise<string> {
        const { data: { length } } = await this.kit.repos.listReleases({ ...this.repository });
        let since: string = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.kit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        }

        return since;
    }
}
