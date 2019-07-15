import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import Reader from './io/reader';
import Writer from './io/writer';
import { Provider, ServiceProvider } from './providers/provider';
import GitHubProvider from './providers/github-provider';
import { Configuration } from './entities/configuration';
import { Package } from './entities/package';

dotenv.config();

const $tasks = TaskTree.tree();

export default class Changelog {
    private config: Configuration;
    private pkg: Package;

    public constructor() {
        this.config = new Configuration();
        this.pkg = new Package();
    }

    public async generate(): Promise<void> {
        const provider = await this.loadConfiguration();

        if (provider) {
            const reader = new Reader(provider);
            const state = await reader.read();
            const writer = new Writer(this.pkg);

            await state.modify(this.config);
            await writer.write(state);
        }
    }

    private async loadConfiguration(): Promise<Provider | undefined> {
        const { config } = this;
        const task = $tasks.add('Read configuration');
        let provider: Provider | undefined;

        await config.load(task);

        switch (config.getProvider()) {
            case ServiceProvider.GitLab:
                task.fail(`${ServiceProvider.GitLab} - not supported yet`);
                break;
            case ServiceProvider.GitHub:
                provider = new GitHubProvider(this.pkg.getRepository());
                break;
            default:
                task.fail(`Service provider not specified`);
                break;
        }

        task.complete('Configuration initialized with:');

        return provider;
    }
}
