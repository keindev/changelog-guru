import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'
import { ReposListCommitsResponseItem } from '@octokit/rest';
import Config from './config';
import Git from '../middleware/git';
import PluginManager from '../middleware/managers/plugin';
import State from '../middleware/state';
import Commit from '../entities/commit';
import Process from '../utils/process';
import Package from './package';
import Entity from '../entities/entity';

export default class Reader extends Entity {
    private state: State = new State();
    private git: Git;
    private plugins: PluginManager;

    public constructor(token: string, userConfigPath?: string) {
        super();

        const load = (configPath: string): Config => yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
        const config: Config = load(path.join(__dirname, '../../.changelog.yaml'));

        if (userConfigPath) {
            this.debug('read: %s', userConfigPath);

            const userConfig = load(userConfigPath);

            config.plugins = config.plugins.concat(userConfig.plugins || []);
            if (Array.isArray(userConfig.types) && userConfig.types.length) {
                config.types = userConfig.types;
            }

            delete userConfig.plugins;
            delete userConfig.types;

            Object.keys(userConfig).forEach((name): void => {
                config[name] = userConfig[name];
            });
        }

        this.git = new Git(token);
        this.plugins = new PluginManager(config, this.state);
    }

    public async read(): Promise<[State, PluginManager]> {
        await this.plugins.load();
        await this.readPackage();
        await this.readCommits();

        return [this.state, this.plugins];
    }

    private async readPackage(): Promise<void> {
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const pkg: Package = await import(pkgPath);
        const { version, repository } = pkg;

        if (!version) Process.error('<package.version> is not specified');
        if (!repository) Process.error('<package.repository> is not specified');
        if (!repository.url) Process.error('<package.repository.url> is not specified');
        if (!repository.type) Process.error('<package.repository> is not git repository type');

        this.debug('parse: %s', pkgPath);

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

            commits.forEach((response: ReposListCommitsResponseItem): void => {
                const { commit, html_url: url, sha } = response;
                const { author: { id: authorId, html_url: authorUrl, avatar_url: authorAvatar, login } } = response;
                const timestamp = new Date(commit.author.date).getTime();
                const { state } = this;
                const author = state.addAutor(authorId, login, authorUrl, authorAvatar);

                state.commits.add(new Commit(sha, timestamp, commit.message, url, author));
            });

            if (length === Git.COMMITS_PAGE_SIZE) {
                await this.readCommits(pageNumber);
            }
        }
    }
}
