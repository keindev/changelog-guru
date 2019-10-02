import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state/state.mock';
import ScopePlugin, { ScopePluginOptions, ScopeNames } from '../../src/plugins/implementations/scope';
import { ConfigLoader } from '../../src/config/config-loader';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { PluginOption } from '../../src/config/config';

describe('ScopePlugin', () => {
    const $author = new Author({
        login: 'keindev',
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    let $plugin: ScopePlugin;
    let $options: PluginOption;

    beforeEach(done => {
        const loader = new ConfigLoader();
        const context = new MockState();

        $plugin = new ScopePlugin(context);

        loader.load().then(config => {
            const options = config.getPlugin('scope');

            if (options) {
                $options = options;
            } else {
                expect(options).toBeDefined();
            }

            done();
        });
    });

    it('Default', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Core, Jest 1, Jest 2): subject',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.init($options as ScopePluginOptions).then(() => {
            $plugin.parse(commit).then(() => {
                expect(commit.getAccents()).toStrictEqual(['Core', 'Jest 1', 'Jest 2']);

                done();
            });
        });
    });

    it('Lint', done => {
        const task = new Task('lint');
        const options = {
            header: 'test(scope): subject',
            body: [],
            type: 'test',
            subject: 'subject',
        };

        $plugin.init({ onlyPresented: true, names: $options.names as ScopeNames }).then(() => {
            $plugin.lint(Object.assign(options, { scope: 'core, api' }), task);

            expect(task.haveErrors()).toBeFalsy();

            $plugin.lint(Object.assign(options, { scope: 'abcd' }), task);

            expect(task.haveErrors()).toBeTruthy();

            done();
        });
    });

    it('Only presented in config', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Core, Jest 1, Jest 2): subject',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.init({ onlyPresented: true, names: $options.names as ScopeNames }).then(() => {
            $plugin.parse(commit).then(() => {
                expect(commit.getAccents()).toStrictEqual(['Core']);

                done();
            });
        });
    });
});
