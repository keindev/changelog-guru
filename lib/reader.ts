import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import pckg from './../package.json';
import program from 'commander';
import State from './state';
import Utils, { Errors } from './utils';
import Octokit, { ReposListCommitsParams, ReposListReleasesParams } from '@octokit/rest';

const CONFIG_FILE_NAME: string = '.changelog';
const TOKEN_ENV_NAME: string = 'CHANGELOG_GURU_TOKEN';
const COMMITS_PAGING_PAGE_SIZE: number = 100;

program
    .version(pckg.version, '-v, --version')
    .description(pckg.description)
    .option('-c, --config <config>', `config file in JSON format (${CONFIG_FILE_NAME}).`)
    .option('-t, --token <token>', `your GitHub token (process.env.${TOKEN_ENV_NAME} by default).`)
    .parse(process.argv);

export type Package = {
    version?: string;
    repository?: {
        type?: string,
        url?: string
    }
}

export type Config = {
    test?: string
}

export class Reader {
    private state: State = new State();
    private token: string = program.token || process.env[TOKEN_ENV_NAME];
    private repository: ReposListReleasesParams = { owner: '', repo: '' };
    private package: Package = {};
    private config: Config = {};
    private octokit: Octokit;
    private sha: string;
    private packagePath: string;
    private configPath: string;

    constructor() {
        this.configPath = path.resolve(process.cwd(), program.config || path.join(__dirname, `../${CONFIG_FILE_NAME}`));
        this.packagePath = path.resolve(process.cwd(), 'package.json');

        if (!fs.existsSync(this.configPath)) Utils.error(Errors.CONFIG_NOT_FOUND);
        if (!fs.existsSync(this.packagePath)) Utils.error(Errors.PACKAGE_NOT_FOUND);
        if (!this.token) Utils.error(Errors.TOKEN_IS_NOT_PROVIDED);

        this.octokit = new Octokit({ auth: `token ${this.token}` });
        this.sha = Utils.getSHA(process.cwd());
    }

    async init() {
        this.package = await import(this.packagePath);
        this.config = await import(this.configPath);

        if (!this.package.version || !semver.valid(this.package.version)) {
            Utils.error(Errors.PACKAGE_VERSION_IS_INVALID);
        }

        const repository = this.package.repository;

        if (repository && repository.type === 'git' && repository.url && repository.url.length) {
            const pathname = (new URL(repository.url)).pathname.split('/');

            this.repository.repo = path.basename(pathname.pop() as string, '.git');
            this.repository.owner = pathname.pop() as string;

            Utils.info('Repository', this.repository.repo);
            Utils.info('Owner', this.repository.owner);
            Utils.info("SHA", this.sha);
        } else {
            Utils.error(Errors.TOKEN_IS_NOT_PROVIDED);
        }
    }

    async getSince() {
        const { data: { length } } = await this.octokit.repos.listReleases({ ...this.repository });
        let since = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.octokit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        }

        Utils.info('Get last commits since', since);

        return since;
    }



    async parse() {
        const since: string = await this.getSince();
        const params: ReposListCommitsParams & {
            page: number
        } = {
            ...this.repository,
            sha: this.sha,
            since: since,
            ...{ per_page: COMMITS_PAGING_PAGE_SIZE, page: 1 }
        };
        let count: number = 0;

        do {
            const { data: commits } = await this.octokit.repos.listCommits(params);

            if (count = commits.length) {
                Utils.log(`${count} commits`, 'loaded');

                commits.forEach((commit) => {
                    this.state.addCommit(commit);
                });

                params.page++;
            }
        } while (count && count === COMMITS_PAGING_PAGE_SIZE);

        Utils.info('Read', `${this.state.commits.length} commits...`);
        Utils.info('Current version', this.package.version);
        Utils.info('Next version', this.state.version);

        return this.state;
    }
}
