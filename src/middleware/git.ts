import Octokit, { ReposListCommitsResponseItem, ReposListReleasesParams } from '@octokit/rest';
import findupSync from 'findup-sync';
import fs from 'fs';
import Process from '../utils/process';
import Entity from '../entities/entity';

export default class Git extends Entity {
    public static COMMITS_PAGE_SIZE: number = 100;
    public static EXTENSION: string = '.git';

    // TODO: rename
    private _lastReleaseDate: string = '';
    private kit: Octokit;
    private repository: ReposListReleasesParams = { repo: '', owner: '' };
    private sha: string = '';

    public get lastReleaseDate(): string {
        return this._lastReleaseDate;
    }

    public static getSHA(cwd: string): string {
        const pattern = `${Git.EXTENSION}/HEAD`;
        const filepath = findupSync(pattern, { cwd });
        let sha = '';

        if (fs.existsSync(filepath)) {
            const buffer: Buffer = fs.readFileSync(filepath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                [,sha] = match;
            } else {
                Process.error(`{bold ${pattern}} - ref(s) SHA not found`);
            }
        } else {
            Process.error(`{bold ${pattern}} - does not exist`);
        }

        return sha;
    }

    public constructor(token: string) {
        super();

        this.kit = new Octokit({ auth: `token ${token}` });
        this.sha = Git.getSHA(process.cwd());
    }

    public async init(repo: string, owner: string): Promise<void> {
        this.repository.repo = repo;
        this.repository.owner = owner;
        this._lastReleaseDate = await this.getLatestReleaseDate();

        Process.info('Repository', this.repository.repo);
        Process.info('Owner', this.repository.owner);
        Process.info('SHA', this.sha);
    }

    public async getCommits(page: number): Promise<ReposListCommitsResponseItem[]> {
        this.debug(`load page #${page.toString()}`);

        const { data: commits } = await this.kit.repos.listCommits({
            page,
            ...this.repository,
            sha: this.sha,
            since: this._lastReleaseDate,
            'per_page': Git.COMMITS_PAGE_SIZE
        });

        return commits;
    }

    private async getLatestReleaseDate(): Promise<string> {
        const { data: { length } } = await this.kit.repos.listReleases({ ...this.repository });
        let since: string = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.kit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        } else {
            this.debug('repository does not have releases');
        }

        Process.info('Get last commits since', since);

        return since;
    }
}
