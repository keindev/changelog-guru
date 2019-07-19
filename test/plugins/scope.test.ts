import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state.mock';
import { Configuration } from '../../src/entities/configuration';
import { Commit } from '../../src/entities/commit';
import ScopePlugin, { Configuration as ScopeConfiguration } from '../../src/plugins/scope';

describe('ScopePlugin', (): void => {
    const context = new MockState();
    const task = new Task('test task');
    let config: Configuration;
    let plugin: ScopePlugin;

    beforeEach((): void => {
        config = new Configuration();
        plugin = new ScopePlugin(context);
    });

    it('Any scopes', (done): void => {
        config.load(task).then((): void => {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `feat(Core, Jest 1, Jest 2): subject`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            plugin.init(config.getOptions() as ScopeConfiguration).then((): void => {
                plugin.parse(commit).then((): void => {
                    expect(commit.getAccents()).toStrictEqual(['Core', 'Jest 1', 'Jest 2']);

                    done();
                });
            });
        });
    });

    it('Strict scopes', (done): void => {
        config.load(task).then((): void => {
            const options = config.getOptions();
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `feat(Core, Jest 1, Jest 2): subject`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            (options as ScopeConfiguration).scopes.only = true;

            plugin.init(options as ScopeConfiguration).then((): void => {
                plugin.parse(commit).then((): void => {
                    expect(commit.getAccents()).toStrictEqual(['Core']);

                    done();
                });
            });
        });
    });
});
