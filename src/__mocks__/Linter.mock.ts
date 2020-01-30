import path from 'path';
import { Task } from 'tasktree-cli/lib/task';
import { Linter, LinterOptions } from '../Linter';
import PluginLoader from '../plugins/PluginLoader';

export class MockLinter extends Linter {
    public static MOCK_PLUGIN_EXTENSION = 'ts';

    public constructor(task: Task, options: LinterOptions) {
        super(task, options);

        this.pluginLoader = new PluginLoader(
            path.resolve(__dirname, '../../src/plugins/implementations'),
            MockLinter.MOCK_PLUGIN_EXTENSION
        );
    }
}
