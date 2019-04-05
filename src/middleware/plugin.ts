import path from 'path';
import State from './state';
import AbstractPlugin from '../entities/plugin';
import Commit from '../entities/commit';
import Config from '../io/config';
import Modifier from '../entities/modifier';
import Process from '../utils/process';

const debug = Process.getDebugger('middleware:plugin');

interface Plugin<T> {
    new(config: Config) : T;
}

interface ImportedPlugin {
    default: Plugin<AbstractPlugin>
}

export default class PluginManager extends AbstractPlugin {
    private plugins: AbstractPlugin[];

    public constructor(config: Config) {
        super(config);

        this.plugins = [];
    }

    public async load(): Promise<void> {
        const { config } = this;
        const promises: Promise<ImportedPlugin>[] = config.plugins.map((name): Promise<ImportedPlugin> =>
            import(path.resolve(__dirname, '../plugins', `${name}.js`)));
        const plugins: ImportedPlugin[] = await Promise.all(promises);

        debug('import & create [Plugins]: %j', config.plugins);

        plugins.map((plugin): Plugin<AbstractPlugin> => plugin.default).forEach((PluginClass, index): void => {
            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                const plugin: AbstractPlugin = new PluginClass(config);

                if (plugin instanceof AbstractPlugin) {
                    this.plugins.push(plugin);
                } else {
                    debug('[Plugin]: %s failed, is not a [AbstractPlugin].', config.plugins[index]);
                }
            } else {
                debug('create [Plugin]: %s failed, is not a class.', config.plugins[index]);
            }
        });
    }

    public async process(state: State, commit: Commit): Promise<void> {
        this.parse(commit);
        await this.modify(state, commit);
    }

    public parse(commit: Commit): void {
        debug('parse [Commit]: %s', commit.sha);

        this.plugins.forEach((plugin): void => {
            plugin.parse(commit);
        });
    }

    public async modify(state: State, commit: Commit): Promise<void> {
        debug('modify [Commit]: %s', commit.sha);

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
