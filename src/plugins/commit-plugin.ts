import { Task } from 'tasktree-cli/lib/entities/task';
import { BasePlugin } from './base-plugin';
import { Commit } from '../entities/commit';
import { PluginLintOptions } from '../linter';

export abstract class CommitPlugin extends BasePlugin {
    public abstract async parse(commit: Commit, task: Task): Promise<void>;

    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/member-ordering, class-methods-use-this */
    public lint(options: PluginLintOptions, task: Task): void {
        // empty
    }
}
