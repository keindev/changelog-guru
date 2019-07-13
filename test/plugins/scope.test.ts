import ScopePlugin, { Configuration as ScopeConfiguration } from '../../src/plugins/scope';
import { TestContext } from '../__mocks__/context.mock';
import { Configuration } from '../../src/entities/configuration';
import Commit from '../../src/entities/commit';

const context = new TestContext();

describe('ScopePlugin', (): void => {
    it('Any scopes', (done): void => {
        const config = new Configuration();

        config.load().then((): void => {
            const plugin = new ScopePlugin(context);
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `feat(Core, Jest 1, Jest 2): subject`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            plugin.init(config.getOptions() as ScopeConfiguration);
            plugin.parse(commit);

            expect(commit.getAccents()).toStrictEqual(['Core', 'Jest 1', 'Jest 2']);

            done();
        });
    });

    it('Strict scopes', (done): void => {
        const config = new Configuration();

        config.load().then((): void => {
            const plugin = new ScopePlugin(context);
            const options = config.getOptions();
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `feat(Core, Jest 1, Jest 2): subject`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            (options as ScopeConfiguration).scopes.only = true;

            plugin.init(options as ScopeConfiguration);
            plugin.parse(commit);

            expect(commit.getAccents()).toStrictEqual(['Core']);

            done();
        });
    });
});
