import path from 'path';
import Process from '../utils/process';

export interface Plugin {

}

export default class PluginManager {
    private loaded: string[] = [];
    private plugins: Plugin[] = [];

    public async load(name: string): Promise<void> {
        if (this.loaded.indexOf(name)) {
            const plugin: Plugin = await import(path.resolve(__dirname, 'plugins', name));

            this.plugins.push(plugin);
        }
    }
}
