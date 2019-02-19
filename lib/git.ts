import Utils from './utils';
import Octokit from '@octokit/rest';
import { ReposListCommitsResponseItem, ReposListReleasesParams } from '@octokit/rest';

export default class Git {
    static COMMITS_PAGE_SIZE: number = 100;

    private kit: Octokit;
    private repository: ReposListReleasesParams;
    private sha: string;

    constructor(repo: string, owner: string, token: string, sha: string) {
        this.repository = { repo: repo, owner: owner } as ReposListReleasesParams;
        this.sha = sha;
        this.kit = new Octokit({ auth: `token ${token}` });

        Utils.info('Repository', this.repository.repo);
        Utils.info('Owner', this.repository.owner);
        Utils.info("SHA", this.sha);
    }

    public async getSince(): Promise<string> {
        const { data: { length } } = await this.kit.repos.listReleases({ ...this.repository });
        let since: string = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.kit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        }

        Utils.info('Get last commits since', since);

        return since;
    }

    public async getCommits(since: string, page: number): Promise<ReposListCommitsResponseItem[]> {
        const { data: commits } = await this.kit.repos.listCommits({
            ...this.repository,
            sha: this.sha,
            since: since,
            ...{ per_page: Git.COMMITS_PAGE_SIZE, page: page }
        });

        return commits;
    }
}
