import path from 'path';
import { Task } from 'tasktree-cli/lib/task';
import { Linter, ILinterOptions } from '../Linter';
import PluginLoader from '../plugins/PluginLoader';

export class MockLinter extends Linter {
    static MOCK_PLUGIN_EXTENSION = 'ts';

    constructor(task: Task, options: ILinterOptions) {
        super(task, options);

        this.pluginLoader = new PluginLoader(
            path.resolve(__dirname, '../../src/plugins/implementations'),
            MockLinter.MOCK_PLUGIN_EXTENSION
        );
    }
}
