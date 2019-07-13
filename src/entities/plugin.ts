import { Task } from 'tasktree-cli/lib/task';
import Commit from './commit';
import { Context } from './state';
import { ConfigurationOptions } from './configuration';

export default abstract class Plugin {
    protected context: Context;

    public constructor(context: Context) {
        this.context = context;
    }

    public abstract async init(config: ConfigurationOptions): Promise<void>;
    public abstract async parse(commit: Commit, task: Task): Promise<void>;
}
