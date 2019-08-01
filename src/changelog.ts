import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import { Reader } from './io/reader';
import { Writer } from './io/writer';
import { Provider } from './providers/provider';
import { Config } from './config/config';
import { Package } from './package/package';
import { ConfigLoader } from './config/config-loader';
import { State } from './state/state';
import { ChangelogOptions } from './typings/types';

export class Changelog {
    private options: ChangelogOptions;
    private package: Package;

    public constructor(options?: ChangelogOptions) {
        dotenv.config();

        this.package = new Package();
        this.options = options || {};
    }

    public async generate(): Promise<void> {
        const [config, provider] = await this.getConfig();
        const state = await this.readState(config, provider);

        await this.writeState(state);
    }

    private async getConfig(): Promise<[Config, Provider]> {
        const task = TaskTree.tree().add('Read configuration');
        const loader = new ConfigLoader(this.options);
        const config = await loader.load();
        const provider = await config.getProvider(this.package.getRepository(), this.options.branch);

        task.complete('Configuration initialized with:');

        return [config, provider];
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
