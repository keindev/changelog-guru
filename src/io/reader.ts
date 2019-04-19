import path from 'path';
import GitHubProvider from './providers/github-provider';
import Provider, { ProviderName } from './providers/provider';
import State from '../entities/state';
import Process from '../utils/process';
import Package from './package';

export default class Reader {
    private provider: Provider | undefined;
    private state: State;

    public constructor(name: ProviderName) {
        switch (name) {
        case ProviderName.GitHub: this.provider = new GitHubProvider(); break;
        // TODO: GitLab
        default: Process.error('unexpected git provider name'); break;
        }

        this.state = new State();
    }

    public async read(): Promise<State> {
        await this.readPackage();
        await this.readCommits();

        return this.state;
    }

    private async readPackage(): Promise<void> {
        if (this.provider) {
            const pkg: Package = await import(path.resolve(process.cwd(), 'package.json'));
            const { version, repository } = pkg;

            if (!version) Process.error('pkg.version is not specified');
            if (!repository) Process.error('pkg.repository is not specified');
            if (!repository.url) Process.error('pkg.repository.url is not specified');
            if (!repository.type) Process.error('pkg.repository.type is not git repository type');

            const pathname: string[] = (new URL(repository.url)).pathname.split('/');
            const repo: string = path.basename(pathname.pop() as string, Provider.EXTENSION);
            const owner: string = pathname.pop() as string;

            await this.provider.init(repo, owner);
            this.state.setVersion(version);
        }
    }

    private async readCommits(pageNumber: number = 0): Promise<void> {
        if (this.provider) {
            const commits = await this.provider.getCommits(pageNumber + 1);
            const { length } = commits;

            if (length) {
                commits.forEach((entities): void => {
                    this.state.addCommit(...entities);
                });

                if (length === Provider.COMMITS_PAGE_SIZE) {
                    await this.readCommits(pageNumber);
                }
            }
        }
    }
}
