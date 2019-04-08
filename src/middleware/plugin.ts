import path from 'path';
import State from './state';
import AbstractPlugin from '../entities/plugin';
import Commit from '../entities/commit';
import Config from '../io/config';
import Entity from '../entities/entity';

interface Plugin<T> {
    new(config: Config, state: State) : T;
}

interface ImportedPlugin {
    default: Plugin<AbstractPlugin>
}

export default class PluginManager extends AbstractPlugin {
    private plugins: AbstractPlugin[];

    public constructor(config: Config, state: State) {
        super(config, state);

        this.plugins = [];
    }

    public async load(): Promise<void> {
        const { config } = this;
        const promises: Promise<ImportedPlugin>[] = config.plugins.map((name): Promise<ImportedPlugin> =>
            import(path.resolve(__dirname, '../plugins', `${name}.js`)));
        const plugins: ImportedPlugin[] = await Promise.all(promises);

        this.debug('load plugins: %j', config.plugins);

        plugins.map((plugin): Plugin<AbstractPlugin> => plugin.default).forEach((PluginClass, index): void => {
            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                const plugin: AbstractPlugin = new PluginClass(config, this.state);

                if (plugin instanceof AbstractPlugin) {
                    this.plugins.push(plugin);
                } else {
                    this.debug('%s is not a Plugin.', config.plugins[index]);
                }
            } else {
                this.debug('%s is not a class.', config.plugins[index]);
            }
        });
    }

    public async process(commit: Commit): Promise<void> {
        this.parse(commit);
        await this.modify(commit);
    }

    public parse(commit: Commit): void {
        this.debug('parse: %s', commit.sha);

        this.plugins.forEach((plugin): void => {
            plugin.parse(commit);
        });
    }

    public async modify(commit: Commit): Promise<void> {
        this.debug('modify: %s', commit.sha);

        let modifier: Entity | undefined;
        const promises: Promise<void>[] = [];
        const modify = (plugin: AbstractPlugin): void => {
            if (plugin.isCompatible(modifier as Entity)) {
                promises.push(plugin.modify(commit, modifier as Entity));
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
