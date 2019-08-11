import { Reader } from '../../src/io/reader';
import { MockProvider } from '../__mocks__/providers/provider.mock';
import { Package } from '../../src/package/package';
import { ServiceProvider } from '../../src/config/config';

describe('Writer', (): void => {
    it('Default', (done): void => {
        const provider = new MockProvider(ServiceProvider.GitHub, 'https://github.com/keindev/changelog-guru.git');
        const reader = new Reader(provider);
        const pkg = new Package();

        reader.read(pkg).then((state): void => {
            // eslint-disable-next-line no-underscore-dangle
            expect(state.getAuthors()).toStrictEqual([provider.__author]);
            // eslint-disable-next-line no-underscore-dangle
            expect(state.getCommits()).toStrictEqual([provider.__commit]);

            done();
        });
    });
});
