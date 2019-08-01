import { Task } from 'tasktree-cli/lib/task';
import { BasePlugin } from './base-plugin';
import { Commit } from '../entities/commit';

export abstract class CommitPlugin extends BasePlugin {
    public abstract async parse(commit: Commit, task: Task): Promise<void>;
}
