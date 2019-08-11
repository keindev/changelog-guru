import { ConfigLoader } from '../../src/config/config-loader';
import { ServiceProvider } from '../../src/config/config';

describe('ConfigLoader', (): void => {
    it('Default', (done): void => {
        const loader = new ConfigLoader();

        loader.load().then((config): void => {
            expect(config.provider).toBe(ServiceProvider.GitHub);
            expect(config.filePath).toBe('CHANGELOG.md');
            expect(config.getTypes()).toMatchSnapshot();
            expect(config.getExclusions()).toMatchSnapshot();
            expect(config.getPlugins()).toMatchSnapshot();

            done();
        });
    });
});
