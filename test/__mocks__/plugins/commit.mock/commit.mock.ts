import { Task } from 'tasktree-cli/lib/task';
import { CommitPlugin } from '../../../../src/plugins/commit-plugin';
import { Commit } from '../../../../src/entities/commit';
import { PluginOption } from '../../../../src/config/typings/types';

export default class MockCommitPlugin extends CommitPlugin {
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async init(config: PluginOption): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async parse(commit: Commit, task: Task): Promise<void> {
        return Promise.resolve();
    }
}
