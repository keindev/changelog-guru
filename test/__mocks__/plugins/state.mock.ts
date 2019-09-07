import { Task } from 'tasktree-cli/lib/task';
import { StatePlugin } from '../../../src/plugins/state-plugin';
import { PluginOption } from '../../../src/config/config';

export default class MockStatePlugin extends StatePlugin {
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async init(config: PluginOption): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async modify(task: Task): Promise<void> {
        return Promise.resolve();
    }
}
