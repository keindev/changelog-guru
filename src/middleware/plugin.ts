import path from 'path';
import State from './state';
import AbstractPlugin from '../entities/plugin';
import Commit from '../entities/commit';
import Config from '../io/config';
import Modifier from '../entities/modifier';

interface ConstructablePlugin<T> {
    new(config: Config) : T;
}

export default class PluginManager extends AbstractPlugin {
    private plugins: AbstractPlugin[];

    public constructor(config: Config) {
        super(config);

        this.plugins = [];
    }

    public async load(): Promise<void> {
        const { config } = this;
        const promises: Promise<ConstructablePlugin<AbstractPlugin>>[] =
            config.plugins.map(name => import(path.resolve(__dirname, 'plugins', name)));
        const plugins: ConstructablePlugin<AbstractPlugin>[] = await Promise.all(promises);

        plugins.forEach((PluginConstructor) => {
            if (PluginConstructor instanceof AbstractPlugin) {
                this.plugins.push(new PluginConstructor(config))
            }
        });
    }

    public async process(state: State, commit: Commit): Promise<void> {
        this.parse(commit);
        await this.modify(state, commit);
    }

    public parse(commit: Commit): void {
        this.plugins.forEach((plugin) => {
            plugin.parse(commit);
        });
    }

    public async modify(state: State, commit: Commit): Promise<void> {
        const promises: Promise<void>[] = [];
        let modifier: Modifier | undefined;

        while (commit.modifiers.length) {
            modifier = commit.modifiers.pop();

            if (typeof modifier !== 'undefined') {
                this.plugins.forEach((plugin) => {
                    if (plugin.isCompatible(modifier as Modifier)) {
                        promises.push(plugin.modify(state, commit, modifier as Modifier));
                    }
                });
            }
        }

        await Promise.all(promises);
    }
}
