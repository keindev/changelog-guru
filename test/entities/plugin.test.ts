import { TestContext } from '../mocks/context.mock';
import { TestPlugin } from '../mocks/plugin.mock';

describe('Plugin', (): void => {
    it('Create', (): void => {
        const context = new TestContext();
        const plugin = new TestPlugin(context);

        expect(plugin.getContext()).toStrictEqual(context);
    });
});
