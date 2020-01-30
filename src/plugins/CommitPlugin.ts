import { Task } from 'tasktree-cli/lib/task';
import BasePlugin from './BasePlugin';
import Commit from '../entities/Commit';
import { PluginLintOptions } from '../Linter';

export default abstract class CommitPlugin extends BasePlugin {
    public abstract async parse(commit: Commit, task: Task): Promise<void>;

    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/member-ordering, class-methods-use-this */
    public lint(options: PluginLintOptions, task: Task): void {
        // empty
    }
}
