import path from 'path';
import { State } from '../../../src/state/state';

export class MockState extends State {
    public static MOCK_PLUGINS = ['commit.mock', 'state.mock'];
    public static MOCK_PLUGIN_EXTENSION = 'ts';

    public constructor() {
        super();

        this.pluginsPath = path.resolve(__dirname, '../plugins/');
        this.pluginsExtension = MockState.MOCK_PLUGIN_EXTENSION;
    }
}
