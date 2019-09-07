import fs from 'fs';
import path from 'path';
import { Task } from 'tasktree-cli/lib/task';
import { PluginOption } from '../config/config';
import { BasePlugin } from './base-plugin';
import { CommitPlugin } from './commit-plugin';
import { StatePlugin } from './state-plugin';
import { StateContext } from '../state/state';

export interface ConstructablePlugin<T, C> {
    new (context: C): T;
}

export interface ImportablePlugin<T, C> {
    default: ConstructablePlugin<T, C>;
}

export interface PluginLoadOptions {
    name: string;
    config: PluginOption;
    context: StateContext;
}

export class PluginLoader {
    public static DEFAULT_DIRECTORY = path.resolve(__dirname, '../plugins/implementations');
    public static DEFAULT_EXTENSION = 'js';

    protected directory: string;
    protected extension: string;

    public constructor(directory?: string, extension?: string) {
        this.directory = directory || PluginLoader.DEFAULT_DIRECTORY;
        this.extension = extension || PluginLoader.DEFAULT_EXTENSION;
    }

    public async load(task: Task, options: PluginLoadOptions): Promise<BasePlugin> {
        type PluginType = BasePlugin | CommitPlugin | StatePlugin;
        const filePath = path.join(this.directory, `${options.name}.${this.extension}`);
        let plugin: BasePlugin | undefined;

        if (fs.existsSync(filePath)) {
            const module: ImportablePlugin<PluginType, StateContext> = await import(filePath);
            const PluginClass: ConstructablePlugin<PluginType, StateContext> = module.default;

            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                plugin = new PluginClass(options.context);

                if (plugin instanceof BasePlugin) {
                    await plugin.init(options.config);
                } else {
                    task.fail(`{bold ${PluginClass.name}} is not Plugin class`);
                }
            } else {
                task.fail(`{bold ${options.name}} is not constructor`);
            }
        } else {
            task.fail(`Plugin {bold ${options.name}} not found`);
        }

        return plugin as BasePlugin;
    }
}
