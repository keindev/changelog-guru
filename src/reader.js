const fs = require('fs');
const path = require('path');
const url = require('url');
const program = require('commander');
const branch = require('git-branch');
const package = require('../package.json');
const State = require('./state');
const Octokit = require('@octokit/rest')

const CONFIG_FILE_NAME = '.changelog';
const TOKEN_ENV_NAME = 'CHANGELOG_GURU_TOKEN';

const ERROR_MSG_PACKAGE_NOT_FOUND = 'package.json not found';
const ERROR_MSG_CONFIG_NOT_FOUND = `<config> options is not an existing filename (${CONFIG_FILE_NAME})`;
const ERROR_MSG_TOKEN_IS_NOT_PROVIDED = '<token> options must be provided';
const ERROR_MSG_REPOSITORY_IS_NOT_SPECIFIED = 'project repository not specified';

const COMMITS_PAGING_PAGE_SIZE = 100;
const COMMITS_PAGING_START_PAGE = 1;

program
    .version(package.version)
    .description(package.description)
    .option('-c, --config <config>', `Config file in JSON format (${CONFIG_FILE_NAME}).`)
    .option('-t, --token <token>', `Your GitHub token (process.env.${TOKEN_ENV_NAME} by default).`)
    .parse(process.argv);

class Reader {
    constructor() {
        this.state = new State();
        this.token = program.token || process.env[TOKEN_ENV_NAME];
        this.configPath = path.resolve(process.cwd(), program.config || path.join(__dirname, `../${CONFIG_FILE_NAME}`));
        this.packagePath = path.resolve(process.cwd(), 'package.json');
        this.owner = '';
        this.repo = '';
        this.package = null;
        this.config = null;
        this.sha = branch.sync(process.cwd());
        this.page = {
            size: COMMITS_PAGING_PAGE_SIZE,
            number: COMMITS_START_PAGE
        };
    }

    prepare() {
        if (!fs.existsSync(this.configPath)) this.exit(ERROR_MSG_CONFIG_NOT_FOUND);
        if (!fs.existsSync(this.packagePath)) this.exit(ERROR_MSG_PACKAGE_NOT_FOUND);
        if (!this.token) this.exit(ERROR_MSG_TOKEN_IS_NOT_PROVIDED);

        this.package = require(this.packagePath);
        this.config = require(this.configPath);

        const repository = package.repository;

        if (repository && repository.type === 'git' && repository.url && repository.url.length) {
            const pathname = (new URL(repository.url)).pathname.split('/');

            this.owner = pathname[pathname.length - 2];
            this.repo = path.basename(pathname[pathname.length - 1], '.git');
        } else {
            this.exit(ERROR_MSG_REPOSITORY_IS_NOT_SPECIFIED);
        }
    }

    parse() {
        this.prepare();

        const octokit = new Octokit({ auth: `token ${this.token}` });
        const release = await octokit.repos.getLatestRelease({ this.owner, this.repo });
        let commits;

        do {
            commits = await octokit.repos.listCommits({
                this.owner,
                this.repo,
                this.sha,
                since: release.created_at,
                per_page: this.page.size,
                page: this.page.number
            });

            // TODO: parse commit
        } while (commits.length);
    }

    exit(msg) {
        console.error(`\n${msg}`);

        program.help();
        process.exit(1);
    }
}

path.join(__dirname, )

module.exports = StateReader;
