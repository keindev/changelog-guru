import path from 'path';
import { State } from '../../../src/state/state';
import { PluginLoader } from '../../../src/plugins/plugin-loader';

export class MockState extends State {
    public static MOCK_PLUGINS = ['commit.mock', 'state.mock'];
    public static MOCK_PLUGIN_EXTENSION = 'ts';

    public constructor() {
        super();

        this.pluginLoader = new PluginLoader(path.resolve(__dirname, '../plugins/'), MockState.MOCK_PLUGIN_EXTENSION);
    }
}
