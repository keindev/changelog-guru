import path from 'path';
import State from '../../src/entities/state';

export class TestState extends State {
    public static MOCK_PLUGIN_NAME = 'plugin.mock';
    public static MOCK_PLUGIN_EXTENSION = 'ts';

    public constructor() {
        super();

        this.pluginsPath = path.resolve(__dirname);
        this.pluginsExtension = TestState.MOCK_PLUGIN_EXTENSION;
    }
}
