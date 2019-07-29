import { ConfigLoader } from '../../src/config/config-loader';
import { GitHubProvider } from '../../src/providers/github/provider';

describe('ConfigLoader', (): void => {
    it('Default', (done): void => {
        const loader = new ConfigLoader();

        loader.load().then((config): void => {
            expect(config.getTypes()).toMatchSnapshot();
            expect(config.getExclusions()).toMatchSnapshot();
            expect(config.getPlugins()).toMatchSnapshot();

            config.getProvider('test').then((provider): void => {
                expect(provider instanceof GitHubProvider).toBeTruthy();

                done();
            });
        });
    });
});
