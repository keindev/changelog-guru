import { Task } from 'tasktree-cli/lib/task';
import { CommitPlugin } from '../../../src/entities/plugin';
import { Commit } from '../../../src/entities/commit';
import { ConfigurationOptions } from '../../../src/entities/configuration';

export default class MockCommitPlugin extends CommitPlugin {
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async init(config: ConfigurationOptions): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async parse(commit: Commit, task: Task): Promise<void> {
        return Promise.resolve();
    }
}
