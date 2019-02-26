import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'
import Git from '../middleware/git';
import Process from '../utils/process';
import State, { Options } from '../state';

export interface Package {
    version: string;
    repository: {
        type: string,
        url: string,
    };
}

export interface Config extends Options {
    sections: { [key: string]: string[] };
}

export default class Reader {
    private state: State = new State();
    private git: Git;

    public constructor(token: string) {
        this.git = new Git(token);
    }

    public async readPackage(): Promise<void> {
        const pkg: Package = await import(path.resolve(process.cwd(), 'package.json'));

        if (!pkg.version) Process.error('<package.version> is not specified');
        if (!pkg.repository) Process.error('<package.repository> is not specified');
        if (!pkg.repository.url) Process.error('<package.repository.url> is not specified');
        if (!pkg.repository.type) Process.error('<package.repository> is not git repository type');

        const pathname: string[] = (new URL(pkg.repository.url)).pathname.split('/');
        const repo: string = path.basename(pathname.pop() as string, Git.EXTENSION);
        const owner: string = pathname.pop() as string;

        await this.git.init(repo, owner);
        this.state.version = pkg.version;
    }

    public readConfig(configPath: string): void {
        const config: Config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

        if (typeof config.sections === 'object') {
            Object.keys(config.sections).forEach((name) => {
                this.state.addSection(name, config.sections[name]);
            });
        }

        this.state.stats = config.stats;
    }

    public async readCommits(pageNumber: number = 0): Promise<void> {
        const commits = await this.git.getCommits(pageNumber + 1);
        const { length } = commits;

        if (length) {
            Process.log(`${length} commits`, 'loaded');

            commits.forEach(this.state.addCommit, this.state);

            if (length === Git.COMMITS_PAGE_SIZE) {
                await this.readCommits(pageNumber);
            }
        }
    }
}
