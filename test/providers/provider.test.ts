import { ServiceProvider } from '../../src/providers/provider';
import { MockProvider } from '../__mocks__/provider.mock';

describe('Provider', (): void => {
    it('Default (github)', (): void => {
        const provider = new MockProvider(ServiceProvider.GitHub, 'https://github.com/keindev/changelog-guru.git');

        expect(provider.type).toBe(ServiceProvider.GitHub);
        // eslint-disable-next-line no-underscore-dangle
        expect(provider.__getRepository()).toBe('changelog-guru');
        // eslint-disable-next-line no-underscore-dangle
        expect(provider.__getOwner()).toBe('keindev');
        // eslint-disable-next-line no-underscore-dangle
        expect(provider.__getBranch().length).toBeGreaterThanOrEqual(3);
    });
});
