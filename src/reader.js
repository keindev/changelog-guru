const fs = require('fs');
const path = require('path');
const url = require('url');
const program = require('commander');
const branch = require('git-branch');
const package = require('../package.json');
const winston = require('winston');
const semver = require('semver');
const State = require('./state');
const Octokit = require('@octokit/rest')

const CONFIG_FILE_NAME = '.changelog';
const TOKEN_ENV_NAME = 'CHANGELOG_GURU_TOKEN';

const ERROR_MSG_PACKAGE_NOT_FOUND = 'package.json not found';
const ERROR_MSG_CONFIG_NOT_FOUND = `<config> options is not an existing filename (${CONFIG_FILE_NAME})`;
const ERROR_MSG_TOKEN_IS_NOT_PROVIDED = '<token> options must be provided';
const ERROR_MSG_REPOSITORY_IS_NOT_SPECIFIED = 'project repository not specified';
const ERROR_MSG_PACKAGE_VERSION_IS_INVALID = 'package version is invalid (see https://semver.org/)'

const COMMITS_PAGING_PAGE_SIZE = 100;

const logger = module.exports = winston.createLogger({
    transports: [
        new winston.transports.Console({ handleExceptions: true })
    ],
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
    )
});

program
    .version(package.version, '-v, --version')
    .description(package.description)
    .option('-c, --config <config>', `config file in JSON format (${CONFIG_FILE_NAME}).`)
    .option('-t, --token <token>', `your GitHub token (process.env.${TOKEN_ENV_NAME} by default).`)
    .parse(process.argv);

class Reader {
    constructor() {
        this.state = new State();
        this.token = program.token || process.env[TOKEN_ENV_NAME];
        this.configPath = path.resolve(process.cwd(), program.config || path.join(__dirname, `../${CONFIG_FILE_NAME}`));
        this.packagePath = path.resolve(process.cwd(), 'package.json');
        this.repository = { owner: '', repo: '' };
        this.package = null;
        this.config = null;
        this.octokit = null;
        this.sha = branch.sync(process.cwd());
        this.paging = {
            per_page: COMMITS_PAGING_PAGE_SIZE,
            page: 1
        };
    }

    init() {
        const log = msg => logger.error(msg) && program.help();

        if (!fs.existsSync(this.configPath)) log(ERROR_MSG_CONFIG_NOT_FOUND);
        if (!fs.existsSync(this.packagePath)) log(ERROR_MSG_PACKAGE_NOT_FOUND);
        if (!this.token) log(ERROR_MSG_TOKEN_IS_NOT_PROVIDED);

        this.octokit = new Octokit({ auth: `token ${this.token}` });
        this.package = require(this.packagePath);
        this.config = require(this.configPath);

        if (!semver.valid(this.package.version)) log(ERROR_MSG_PACKAGE_VERSION_IS_INVALID);

        const repository = this.package.repository;

        if (repository && repository.type === 'git' && repository.url && repository.url.length) {
            const pathname = (new URL(repository.url)).pathname.split('/');

            this.repository.repo = path.basename(pathname.pop(), '.git');
            this.repository.owner = pathname.pop();

            logger.info(`repository "${this.repository.repo}"`);
            logger.info(`owner "${this.repository.owner}"`);
            logger.info(`sha "${this.sha}"`);
        } else {
            log(ERROR_MSG_TOKEN_IS_NOT_PROVIDED);
        }
    }

    async getSince() {
        const { data: { length } } = await this.octokit.repos.listReleases({ ...this.repository });
        let since = (new Date(0)).toISOString();

        if (length) {
            const { data: release } = await this.octokit.repos.getLatestRelease({ ...this.repository });

            since = release.created_at;
        } else {
            logger.warn(`"${this.sha}" sha is not have any releases.`);
        }

        logger.info(`get last commits since: ${since}`);

        return since;
    }

    async parse() {
        const since = await this.getSince();
        const params = {
            ...this.repository,
            sha: this.sha,
            since: since,
            ...this.paging
        };
        let length = 0;

        do {
            const { data: commits } = await this.octokit.repos.listCommits(params);

            length = commits.length;
            params.page++;

            if (length) {
                commits.forEach((commit) => {
                    this.state.addCommit(commit);
                });
            }
        } while (length && length === COMMITS_PAGING_PAGE_SIZE);

        logger.info(`read ${this.state.commits.length} commits...`);
        logger.info(`current version - ${this.package.version}`);
        logger.info(`next version - ${this.state.version}`);

        return this.state;
    }
}

module.exports = Reader;
