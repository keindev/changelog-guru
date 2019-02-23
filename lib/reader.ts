import path from 'path';
import CLI from './cli';
import Git from './git';
import State from './state';
import Process from './process';

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
    private state: State = new State();
    private configPath: string;
    private packagePath: string;
    private git: Git;

    public constructor() {
        const [configPath, packagePath, token] = CLI.parse();

        this.configPath = configPath;
        this.packagePath = packagePath;
        this.git = new Git(token);
    }

    public async read(): Promise<void> {
        await this.readPackage();
        await this.readConfig();
        await this.readCommits();
    }

    private async readPackage(): Promise<void> {
        const packageInfo: Package = await import(this.packagePath);

        if (!packageInfo.version) Process.error('<package.version> is not specified');
        if (!packageInfo.repository) Process.error('<package.repository> is not specified');
        if (!packageInfo.repository.url) Process.error('<package.repository.url> is not specified');
        if (packageInfo.repository.type !== Git.EXTENSION) {
            Process.error('<package.repository> is not git repository type');
        }

        const pathname: string[] = (new URL(packageInfo.repository.url)).pathname.split('/');
        const repo: string = path.basename(pathname.pop() as string, Git.EXTENSION);
        const owner: string = pathname.pop() as string;

        this.git.init(repo, owner);
        this.state.version = packageInfo.version;
    }

    private async readConfig(): Promise<void> {
        const config: Config = await import(this.configPath);

        if (typeof config.sections === 'object') {
            Object.keys(config.sections).forEach((name) => {
                this.state.addSection(name, config.sections[name]);
            });
        }
    }

    private async readCommits(pageNumber: number = 1): Promise<void> {
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
