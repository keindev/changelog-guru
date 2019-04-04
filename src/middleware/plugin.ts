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
            config.plugins.map((name): Promise<ConstructablePlugin<AbstractPlugin>> =>
                import(path.resolve(__dirname, '../plugins', name)));
        const plugins: ConstructablePlugin<AbstractPlugin>[] = await Promise.all(promises);

        plugins.forEach((PluginConstructor): void => {
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
        this.plugins.forEach((plugin): void => {
            plugin.parse(commit);
        });
    }

    public async modify(state: State, commit: Commit): Promise<void> {
        let modifier: Modifier | undefined;
        const promises: Promise<void>[] = [];
        const modify = (plugin: AbstractPlugin): void => {
            if (plugin.isCompatible(modifier as Modifier)) {
                promises.push(plugin.modify(state, commit, modifier as Modifier));
            }
        };

        while (commit.modifiers.length) {
            modifier = commit.modifiers.pop();

            if (typeof modifier !== 'undefined') {
                this.plugins.forEach(modify);
            }
        }

        await Promise.all(promises);
    }
}
