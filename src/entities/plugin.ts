import { Task } from 'tasktree-cli/lib/task';
import Commit from './commit';
import { Context } from './state';
import { ConfigOptions } from './config';

export default abstract class Plugin {
    protected context: Context;

    public constructor(context: Context) {
        this.context = context;
    }

    public abstract async init(config: ConfigOptions): Promise<void>;
    public abstract async parse(commit: Commit, task: Task): Promise<void>;
}
