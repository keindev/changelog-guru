import { MockState } from '../__mocks__/entities/state.mock';
import { ConfigLoader } from '../../src/config/config-loader';
import { ScopePluginOptions } from '../../src/plugins/implementations/scope/typings/types';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import ScopePlugin from '../../src/plugins/implementations/scope/scope';

describe('ScopePlugin', (): void => {
    const $context = new MockState();
    const $author = new Author('keindev', {
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });
    let $loader: ConfigLoader;
    let $plugin: ScopePlugin;

    beforeEach((): void => {
        $loader = new ConfigLoader();
        $plugin = new ScopePlugin($context);
    });

    it('Default', (done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('scope');

            if (options) {
                const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                    timestamp: 0,
                    header: 'feat(Core, Jest 1, Jest 2): subject',
                    url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                    author: $author,
                });

                $plugin.init(options as ScopePluginOptions).then((): void => {
                    $plugin.parse(commit).then((): void => {
                        expect(commit.getAccents()).toStrictEqual(['Core', 'Jest 1', 'Jest 2']);

                        done();
                    });
                });
            } else {
                throw new Error('ScopePlugin config not found!');
            }
        });
    });

    it('Only presented in config', (done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('scope');

            if (options) {
                const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                    timestamp: 0,
                    header: 'feat(Core, Jest 1, Jest 2): subject',
                    url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                    author: $author,
                });

                (options as ScopePluginOptions).scope.onlyPresented = true;

                $plugin.init(options as ScopePluginOptions).then((): void => {
                    $plugin.parse(commit).then((): void => {
                        expect(commit.getAccents()).toStrictEqual(['Core']);

                        done();
                    });
                });
            } else {
                throw new Error('ScopePlugin config not found!');
            }
        });
    });
});
