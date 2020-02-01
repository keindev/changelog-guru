import { Task } from 'tasktree-cli/lib/task';
import Commit from '../entities/Commit';
import { IPluginOption } from '../config/Config';
import { IPluginLintOptions } from '../Linter';
import { IPluginContext, IPlugin } from './PluginLoader';

export interface IModifierPlugin {
    modify(task: Task): Promise<void>;
}

export interface IParserPlugin {
    parse(commit: Commit, task: Task): Promise<void>;
    lint(options: IPluginLintOptions, task: Task): void;
}

export default abstract class BasePlugin<T = IModifierPlugin | IParserPlugin> implements IPlugin {
    protected context: IPluginContext;

    public constructor(context: IPluginContext) {
        this.context = context;
    }

    abstract async init(config: IPluginOption): Promise<void>;
}
