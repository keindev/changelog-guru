import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/entities/state.mock';
import { Configuration } from '../../src/entities/configuration';
import { Commit } from '../../src/entities/commit';
import SectionPlugin, { Configuration as SectionConfiguration } from '../../src/plugins/section';

describe('SectionPlugin', (): void => {
    const context = new MockState();
    const config = new Configuration();
    const plugin = new SectionPlugin(context);
    const task = new Task('test task');

    it('Default', (done): void => {
        config.load(task).then((): void => {
            plugin.init(config.getOptions() as SectionConfiguration).then((): void => {
                expect(context.getSections().length).toBe(6);
                expect(context.findSection('Bug Fixes')).toBeDefined();
                expect(context.findSection('Features')).toBeDefined();
                expect(context.findSection('Internal changes')).toBeDefined();
                expect(context.findSection('Performance Improvements')).toBeDefined();
                expect(context.findSection('Code Refactoring')).toBeDefined();
                expect(context.findSection('Reverts')).toBeDefined();

                done();
            });
        });
    });

    it('Parse commits', (done): void => {
        const section = context.findSection('Bug Fixes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `fix: subject`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            plugin.parse(commit).then((): void => {
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });
});
