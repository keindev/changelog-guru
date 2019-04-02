import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'
import { ReposListCommitsResponseItem } from '@octokit/rest';
import Config from './config';
import Git from '../middleware/git';
import PluginManager from '../middleware/plugin';
import State from '../middleware/state';
import Commit from '../entities/commit';
import Process from '../utils/process';

export interface Package {
    version: string;
    repository: {
        type: string,
        url: string,
    };
}

export default class Reader {
    private state: State = new State();
    private git: Git;
    private plugins: PluginManager;

    public constructor(token: string, userConfigPath?: string) {
        const load = (configPath: string): Config => yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
        const config: Config = load(path.join(__dirname, '../.changelog.yaml'));

        if (userConfigPath) {
            const userConfig = load(userConfigPath);

            config.plugins = config.plugins.concat(userConfig.plugins || []);
            if (Array.isArray(userConfig.types) && userConfig.types.length) {
                config.types = userConfig.types;
            }

            delete userConfig.plugins;
            delete userConfig.types;

            Object.keys(userConfig).forEach((name) => {
                config[name] = userConfig[name];
            });
        }

        this.git = new Git(token);
        this.plugins = new PluginManager(config);
    }

    public async read(): Promise<[State, PluginManager]> {
        await this.plugins.load();
        await this.readPackage();
        await this.readCommits();

        return [this.state, this.plugins];
    }

    private async readPackage(): Promise<void> {
        const pkg: Package = await import(path.resolve(process.cwd(), 'package.json'));
        const { version, repository } = pkg;

        if (!version) Process.error('<package.version> is not specified');
        if (!repository) Process.error('<package.repository> is not specified');
        if (!repository.url) Process.error('<package.repository.url> is not specified');
        if (!repository.type) Process.error('<package.repository> is not git repository type');

        const pathname: string[] = (new URL(repository.url)).pathname.split('/');
        const repo: string = path.basename(pathname.pop() as string, Git.EXTENSION);
        const owner: string = pathname.pop() as string;

        await this.git.init(repo, owner);
        this.state.setVersion(version);
    }

    private async readCommits(pageNumber: number = 0): Promise<void> {
        const commits = await this.git.getCommits(pageNumber + 1);
        const { length } = commits;

        if (length) {
            Process.log(`${length} commits`, 'loaded');

            commits.forEach((response: ReposListCommitsResponseItem) => {
                const { commit, html_url: url } = response;
                const { author: { id: authorId, html_url: authorUrl, avatar_url: authorAvatar } } = response;
                const timestamp = new Date(commit.author.date).getTime();
                const { state } = this;

                state.addCommit(new Commit(timestamp, commit.message, url,
                    state.addAutor(authorId, authorUrl, authorAvatar)));
            });

            if (length === Git.COMMITS_PAGE_SIZE) {
                await this.readCommits(pageNumber);
            }
        }
    }
}
