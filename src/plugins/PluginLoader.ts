import fs from 'fs';
import path from 'path';
import { Task } from 'tasktree-cli/lib/task';
import { IPluginContext, IPlugin } from './Plugin';
import { IPluginOption } from '../core/config/Config';

export interface IConstructablePlugin<T, C> {
    new (context: C): T;
}

export interface IImportablePlugin<T, C> {
    default: IConstructablePlugin<T, C>;
}

export interface IPluginLoadOptions {
    name: string;
    config: IPluginOption;
    context: IPluginContext;
}

export default class PluginLoader {
    public static DEFAULT_DIRECTORY = path.resolve(__dirname, '../plugins/implementations');
    public static DEFAULT_EXTENSION = 'js';

    protected directory: string;
    protected extension: string;

    public constructor(directory?: string, extension?: string) {
        this.directory = directory || PluginLoader.DEFAULT_DIRECTORY;
        this.extension = extension || PluginLoader.DEFAULT_EXTENSION;
    }

    public async load(task: Task, options: IPluginLoadOptions): Promise<IPlugin> {
        const filePath = path.join(this.directory, `${options.name}.${this.extension}`);
        let plugin: IPlugin | undefined;

        if (fs.existsSync(filePath)) {
            const module: IImportablePlugin<IPlugin, IPluginContext> = await import(filePath);
            const PluginClass: IConstructablePlugin<IPlugin, IPluginContext> = module.default;

            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                plugin = new PluginClass(options.context);

                try {
                    await plugin.init(options.config);
                } catch (error) {
                    task.fail(error);
                }
            } else {
                task.fail(`{bold ${options.name}} is not constructor`);
            }
        } else {
            task.fail(`Plugin {bold ${options.name}} not found`);
        }

        return plugin as IPlugin;
    }
}
