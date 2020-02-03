import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import Reader from './core/io/Reader';
import Writer from './core/io/Writer';
import Config, { ServiceProvider } from './core/config/Config';
import Package from './core/package/Package';
import ConfigLoader, { IConfigLoaderOptions } from './core/config/ConfigLoader';
import State from './core/state/State';
import { Linter, ILintOptions } from './Linter';
import Provider from './core/providers/Provider';
import GitHubProvider from './core/providers/GitHubProvider';

export interface IChangelogOptions extends IConfigLoaderOptions {
    bump?: boolean;
    branch?: string;
}

export class Changelog {
    private options: IChangelogOptions;
    private package: Package;

    public constructor(options?: IChangelogOptions) {
        dotenv.config();

        this.package = new Package();
        this.options = options || {};
    }

    public setOptions(options: IChangelogOptions): void {
        this.options = options;
    }

    public async build(): Promise<void> {
        const config = await this.getConfig();
        const provider = this.getProvider(config);
        const state = await this.readState(config, provider);

        await this.writeState(state);
    }

    public async lint(message: string | undefined, options: ILintOptions): Promise<void> | never {
        const config = await this.getConfig();
        const task = TaskTree.add('Lint commit message:');
        const linter = new Linter(task, {
            config: options,
            plugins: config.getPlugins(),
            types: config.getTypes().map(([name]): string => name),
        });

        await linter.lint(message);

        if (task.haveErrors()) {
            task.fail('Incorrect commit message:');
        } else {
            task.complete('Commit message is correct');
        }
    }

    private getProvider(config: Config): Provider {
        const repository = this.package.getRepository();
        const { branch } = this.options;
        let provider: Provider | undefined;

        switch (config.provider) {
            case ServiceProvider.GitLab:
                TaskTree.fail(`{bold ${ServiceProvider.GitLab}} - not supported yet`);
                break;
            case ServiceProvider.GitHub:
                provider = new GitHubProvider(repository, branch);
                break;
            default:
                TaskTree.fail(`Service provider not specified`);
                break;
        }

        return provider as Provider;
    }

    private async getConfig(): Promise<Config> {
        const task = TaskTree.add('Read configuration');
        const loader = new ConfigLoader(this.options);
        const config = await loader.load();

        task.complete('Configuration initialized with:');

        return config;
    }

    private async readState(config: Config, provider: Provider): Promise<State> {
        const reader = new Reader(provider);
        const state = await reader.read(this.package);

        state.setCommitTypes(config.getTypes());
        state.ignoreEntities(config.getExclusions());
        await state.modify(config.getPlugins());

        return state;
    }

    private async writeState(state: State): Promise<void> {
        const writer = new Writer();

        await writer.write(state.getSections(), state.getAuthors());

        if (this.options.bump) {
            await this.package.incrementVersion(...state.getChangesLevels());
        }
    }
}
