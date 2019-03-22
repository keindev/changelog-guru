import path from 'path';
import Plugin from '../entities/plugin';
import { Config } from '../io/reader';

interface ConstructablePlugin<T> {
    new(config: Config) : T;
}

export default class PluginManager extends Plugin {
    private plugins: Plugin[];

    constructor(config: Config) {
        super(config);

        this.plugins = [];
    }

    public async load(): Promise<void> {
        const { plugins, config } = this;
        let plugin: ConstructablePlugin<Plugin>;

        for (const name of config.plugins) {
            if (typeof name === 'string' && name.length) {
                plugin = await import(path.resolve(__dirname, 'plugins', name));
                plugin instanceof Plugin && plugins.push(new plugin(config));
            }
        }
    }

    public async process(): Promise<void> {

    }

    public async parse(): Promise<void> {
        for (const plugin of this.plugins) {
            if (plugin instanceof Plugin) {
                await plugin.parse();
            }
        }
    }

    public async modify(): Promise<boolean> {
        return true;
    }

    public async validate(): Promise<boolean> {
        return true;
    }
}
