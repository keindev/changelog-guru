import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import { Reader } from './io/reader';
import { Writer } from './io/writer';
import { Provider } from './providers/provider';
import { Config, ServiceProvider } from './config/config';
import { Package } from './package/package';
import { ConfigLoader, ConfigLoaderOptions } from './config/config-loader';
import { State } from './state/state';
import { GitHubProvider } from './providers/github/provider';

export interface ChangelogOptions extends ConfigLoaderOptions {
    bump?: boolean;
    branch?: string;
}

export class Changelog {
    private options: ChangelogOptions;
    private package: Package;

    public constructor(options?: ChangelogOptions) {
        dotenv.config();

        this.package = new Package();
        this.options = options || {};
    }

    public setOptions(options: ChangelogOptions): void {
        this.options = options;
    }

    public async generate(): Promise<void> {
        const config = await this.getConfig();
        const provider = this.getProvider(config);
        const state = await this.readState(config, provider);

        await this.writeState(state);
    }

    // eslint-disable-next-line class-methods-use-this
    public async lint(text: string | undefined): Promise<boolean> {
        return Promise.resolve(!!text);
    }

    private getProvider(config: Config): Provider {
        const repository = this.package.getRepository();
        const { branch } = this.options;
        let provider: Provider | undefined;

        switch (config.provider) {
            case ServiceProvider.GitLab:
                TaskTree.fail(`${ServiceProvider.GitLab} - not supported yet`);
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
