import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state/state.mock';
import SectionPlugin, { SectionPluginOptions } from '../../src/plugins/implementations/section';
import { ConfigLoader } from '../../src/config/config-loader';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';

describe('SectionPlugin', (): void => {
    const $context = new MockState();
    const $loader = new ConfigLoader();
    const $plugin = new SectionPlugin($context);
    const $author = new Author('keindev', {
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll((done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('section');

            if (options) {
                $plugin.init(options as SectionPluginOptions).then((): void => {
                    done();
                });
            } else {
                expect(options).toBeDefined();
            }
        });
    });

    it('Default', (): void => {
        expect($context.getSections().length).toBe(7);
        expect($context.findSection('Features')).toBeDefined();
        expect($context.findSection('Improvements')).toBeDefined();
        expect($context.findSection('Bug Fixes')).toBeDefined();
        expect($context.findSection('Internal changes')).toBeDefined();
        expect($context.findSection('Performance Improvements')).toBeDefined();
        expect($context.findSection('Code Refactoring')).toBeDefined();
        expect($context.findSection('Reverts')).toBeDefined();
    });

    it('Lint', (): void => {
        const task = new Task('lint');
        const options = {
            header: 'test(scope): subject',
            body: [],
            scope: 'scope',
            type: 'test',
            subject: 'subject',
        };

        $plugin.lint(Object.assign(options, { type: 'test' }), task);

        expect(task.haveErrors()).toBeFalsy();

        $plugin.lint(Object.assign(options, { type: 'abcd' }), task);

        expect(task.haveErrors()).toBeTruthy();
    });

    it('Parse commits', (done): void => {
        const section = $context.findSection('Bug Fixes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                header: 'fix: subject',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });

            $plugin.parse(commit).then((): void => {
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });
});
