import { Task } from 'tasktree-cli/lib/Task';
import Commit from '../core/entities/Commit';
import License from '../core/License';
import Section, { Position, Order } from '../core/entities/Section';
import { IChange, Dependency, Restriction } from '../core/Package';

export interface IPluginLintOptions {
    header: string;
    body: string[];
    type: string;
    scope: string;
    subject: string;
}

export interface IPluginContext {
    license: License | undefined;

    getChanges(type: Dependency | Restriction): IChange[] | undefined;
    addSection(title: string, position?: Position, order?: Order): Section | undefined;
    findSection(title: string): Section | undefined;
}

export interface IPluginConfig {
    [key: string]: string | boolean | number | string[] | undefined | IPluginConfig | IPluginConfig[];
}

export interface IPlugin {
    modify?: (task: Task) => Promise<void>;
    parse?: (commit: Commit) => Promise<void>;
    lint?: (options: IPluginLintOptions, task: Task) => void;
}

// TODO: create interface instead class
export default abstract class Plugin implements IPlugin {
    protected context?: IPluginContext;
    protected config: IPluginConfig;

    constructor(config: IPluginConfig, context?: IPluginContext) {
        this.config = config;
        this.context = context;
    }

    abstract async init(config: IPluginConfig): Promise<void>;
}
