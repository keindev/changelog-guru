import { Task } from 'tasktree-cli/lib/task';
import { Commit } from './commit';
import { Context } from './state';
import { ConfigurationOptions } from './configuration';

export type PluginType = Plugin | CommitPlugin | StatePlugin;

export abstract class Plugin {
    protected context: Context;

    public constructor(context: Context) {
        this.context = context;
    }

    public abstract async init(config: ConfigurationOptions): Promise<void>;
}

export abstract class CommitPlugin extends Plugin {
    public abstract async parse(commit: Commit, task: Task): Promise<void>;
}

export abstract class StatePlugin extends Plugin {
    public abstract async modify(task: Task): Promise<void>;
}
