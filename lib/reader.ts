import findupSync from 'findup-sync';
import fs from 'fs';
import path from 'path';
import * as semver from 'semver';
import { CLI } from './cli';
import { Git } from './git';
import { State } from './state';
import { Utils } from './utils';

interface Package {
    version: string;
    repository: {
        type: string,
        url: string,
    };
}

interface Config {
    sections: { [key: string]: string[] };
}

export default class Reader {
    private static GIT_EXTENSION: string = '.git';
    private static getSHA(cwd: string): string {
        const pattern = '.git/HEAD';
        const filepath = findupSync(pattern, { cwd });
        let sha = '';

        if (fs.existsSync(filepath)) {
            const buffer: Buffer = fs.readFileSync(filepath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                sha = match[1];
            } else {
                Utils.error(`{bold ${pattern}} - ref(s) SHA not found`);
            }
        } else {
            Utils.error(`{bold ${pattern}} - does not exist`);
        }

        return sha;
    }

    private state: State | null = null;
    private git: Git | null = null;

    public async read(): void {
        const cli = new CLI();
        const [configPath, packagePath, token] = cli.parse(process.cwd(), process.argv);
        const [repo, owner, version] = await this.getRepositoryInfo(packagePath);

        this.git = new Git(repo, owner, token, Reader.getSHA(process.cwd()));
        this.state = new State(version);

        await this.readConfig(configPath);
        await this.readCommits();
    }

    private async getRepositoryInfo(packagePath: string): Promise<string[]> {
        const info: Package = await import(packagePath);

        if (!info.version) Utils.error('<package.version> is not specified');
        if (!semver.valid(info.version)) Utils.error('<package.version> is invalid (see https://semver.org/)');
        if (!info.repository) Utils.error('<package.repository> is not specified');
        if (info.repository.type !== Reader.GIT_EXTENSION) {
            Utils.error('<package.repository.type> is not git repository type');
        }
        if (!info.repository.url) Utils.error('<package.repository.url> is not specified');

        const pathname: string[] = (new URL(info.repository.url)).pathname.split('/');
        const repo: string = path.basename(pathname.pop() as string, Reader.GIT_EXTENSION);
        const owner: string = pathname.pop() as string;

        return [repo, owner, info.version];
    }

    private async readConfig(configPath: string): Promise<void> {
        const config: Config = await import(configPath);

        if (this.state instanceof State) {
            if (typeof config.sections === 'object') {
                Object.keys(config.sections).forEach((name) => {
                    this.state.addSection(name, config.sections[name]);
                });
            }
        }
    }

    private async readCommits(): void {
        if (this.git instanceof Git) {
            const since: string = await this.git.getSince();
            let pageNumber = 1;
            let count = 0;

            do {
                const commits = await this.git.getCommits(since, pageNumber++);
                count = commits.length;

                if (count) {
                    Utils.log(`${count} commits`, 'loaded');

                    commits.forEach((commit) => {
                        this.state.addCommit(commit);
                    });
                }
            } while (count && count === Git.COMMITS_PAGE_SIZE);

            /* Utils.info('Read', `${this.state.commits.length} commits...`);
            Utils.info('Current version', this.package.version);
            Utils.info('Next version', this.state.version); */
        }
    }
}
