import { TestContext } from '../__mocks__/context.mock';
import { TestPlugin } from '../__mocks__/plugin.mock';

describe('Plugin', (): void => {
    it('Create', (): void => {
        const context = new TestContext();
        const plugin = new TestPlugin(context);

        expect(plugin.getContext()).toStrictEqual(context);
    });
});
