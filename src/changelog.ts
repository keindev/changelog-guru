import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import Reader from './io/reader';
import Writer from './io/writer';
import { Provider, ServiceProvider } from './providers/provider';
import GitHubProvider from './providers/github-provider';
import { Configuration } from './entities/config';
import Package from './entities/package';

dotenv.config();

const $tasks = TaskTree.tree();

export default class Changelog {
    private config: Configuration;
    private pkg: Package;
    private reader: Reader | undefined;

    public constructor() {
        const task = $tasks.add('Reading configuration files');

        this.config = new Configuration();
        this.pkg = new Package();
        this.reader = this.getReader();

        if (!this.reader) task.fail(`Provider or Reader is not specified (${this.config.getProvider()})`);

        task.complete();
    }

    public async generate(): Promise<void> {
        const { reader, config } = this;

        if (reader) {
            await config.load();

            const state = await reader.read();
            const writer = new Writer(this.pkg);

            await state.modify(config);
            await writer.write(state);
        }
    }

    private getReader(): Reader | undefined {
        const { config } = this;
        let provider: Provider | undefined;
        let reader: Reader | undefined;

        if (config.getProvider() === ServiceProvider.GitHub) provider = new GitHubProvider(this.pkg.url);
        if (provider) reader = new Reader(provider);

        return reader;
    }
}
