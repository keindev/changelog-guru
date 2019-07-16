import { Task } from 'tasktree-cli/lib/task';
import SectionPlugin, { Configuration as SectionConfiguration } from '../../src/plugins/section';
import Section from '../../src/entities/section';
import { TestContext } from '../__mocks__/context.mock';
import { Configuration } from '../../src/entities/configuration';
import Commit from '../../src/entities/commit';

const context = new TestContext();
const config = new Configuration();
const plugin = new SectionPlugin(context);
const task = new Task('test task');

describe('SectionPlugin', (): void => {
    it('Create', (done): void => {
        config.load(task).then((): void => {
            plugin.init(config.getOptions() as SectionConfiguration);

            expect(context.sections.size).toBe(6);
            expect(context.sections.has('Bug Fixes')).toBeTruthy();
            expect(context.sections.has('Features')).toBeTruthy();
            expect(context.sections.has('Internal changes')).toBeTruthy();
            expect(context.sections.has('Performance Improvements')).toBeTruthy();
            expect(context.sections.has('Code Refactoring')).toBeTruthy();
            expect(context.sections.has('Reverts')).toBeTruthy();

            done();
        });
    });

    it('Parse commits', (): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const section: Section = context.sections.get('Bug Fixes') as any;
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            message: `fix: subject`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: 'keindev',
        });

        plugin.parse(commit);

        expect(section.getCommits()).toStrictEqual([commit]);
    });
});