import rest, { ReposListCommitsResponseItem, ReposListReleasesParams } from '@octokit/rest';
import Process from './process';

export default class Git {
    public static COMMITS_PAGE_SIZE: number = 100;
    private kit: rest;
    private repository: ReposListReleasesParams;
    private sha: string;

    public constructor(repo: string, owner: string, token: string, sha: string) {
        this.repository = { repo, owner } as ReposListReleasesParams;
        this.sha = sha;
        this.kit = new rest({ auth: `token ${token}` });

        Process.info('Repository', this.repository.repo);
        Process.info('Owner', this.repository.owner);
        Process.info('SHA', this.sha);
    }

    public async getSince(): Promise<string> {
        const { data: { length } } = await this.kit.repos.listReleases({ ...this.repository });
        let since: string = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.kit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        }

        Process.info('Get last commits since', since);

        return since;
    }

    public async getCommits(since: string, page: number): Promise<ReposListCommitsResponseItem[]> {
        const { data: commits } = await this.kit.repos.listCommits({
            since,
            ...this.repository,
            sha: this.sha,
            ...{ page, per_page: Git.COMMITS_PAGE_SIZE },
        });

        return commits;
    }
}
