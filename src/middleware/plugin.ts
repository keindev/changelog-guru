import path from 'path';
import State from './state';
import AbstractPlugin from '../entities/plugin';
import Commit from '../entities/commit';
import { Config } from '../io/reader';

interface ConstructablePlugin<T> {
    new(config: Config) : T;
}

export default class PluginManager extends AbstractPlugin {
    private plugins: AbstractPlugin[];

    constructor(config: Config) {
        super(config);

        this.plugins = [];
    }

    public async load(): Promise<void> {
        const { plugins, config } = this;
        let plugin: ConstructablePlugin<AbstractPlugin>;

        for (const name of config.plugins) {
            if (typeof name === 'string' && name.length) {
                plugin = await import(path.resolve(__dirname, 'plugins', name));
                plugin instanceof AbstractPlugin && plugins.push(new plugin(config));
            }
        }
    }

    public async process(state: State, commit: Commit) {
        this.parse(commit);
        await this.modify(state, commit);
    }

    public parse(commit: Commit) {
        this.plugins.forEach((plugin) => {
            plugin.parse(commit);
        });
    }

    public async modify(state: State, commit: Commit): Promise<void> {
        const promises: Promise<void>[] = [];

        this.plugins.forEach((plugin) => {
            promises.push(plugin.modify(state, commit));
        });

        await Promise.all(promises);
    }
}
