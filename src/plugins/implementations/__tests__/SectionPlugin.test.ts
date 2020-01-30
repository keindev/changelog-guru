import { Task } from 'tasktree-cli/lib/task';
import SectionPlugin, { ISectionPluginOptions } from '../SectionPlugin';
import ConfigLoader from '../../../config/ConfigLoader';
import Commit from '../../../entities/Commit';
import Author from '../../../entities/Author';
import State from '../../../state/State';

describe('SectionPlugin', () => {
    const $context = new State();
    const $loader = new ConfigLoader();
    const $plugin = new SectionPlugin($context);
    const $author = new Author({
        login: 'keindev',
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll(done => {
        $loader.load().then(config => {
            const options = config.getPlugin('section');

            if (options) {
                $plugin.init(options as ISectionPluginOptions).then(() => {
                    done();
                });
            } else {
                expect(options).toBeDefined();
            }
        });
    });

    it('Default', () => {
        expect($context.getSections().length).toBe(7);
        expect($context.findSection('Features')).toBeDefined();
        expect($context.findSection('Improvements')).toBeDefined();
        expect($context.findSection('Bug Fixes')).toBeDefined();
        expect($context.findSection('Internal changes')).toBeDefined();
        expect($context.findSection('Performance Improvements')).toBeDefined();
        expect($context.findSection('Code Refactoring')).toBeDefined();
        expect($context.findSection('Reverts')).toBeDefined();
    });

    it('Lint', () => {
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

    it('Parse commits', done => {
        const section = $context.findSection('Bug Fixes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 0,
                header: 'fix: subject',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });

            $plugin.parse(commit).then(() => {
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });
});
