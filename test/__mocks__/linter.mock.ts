import path from 'path';
import { Task } from 'tasktree-cli/lib/task';
import { Linter, LinterOptions } from '../../src/linter';
import { PluginLoader } from '../../src/plugins/plugin-loader';

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
