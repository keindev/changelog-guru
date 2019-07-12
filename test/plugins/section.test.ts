import SectionPlugin, { Config as SectionConfig } from '../../src/plugins/section';
import Section from '../../src/entities/section';
import { TestContext } from '../__mocks__/context.mock';
import { Config } from '../../src/entities/config';
import Commit from '../../src/entities/commit';

const context = new TestContext();
const config = new Config();
const plugin = new SectionPlugin(context);

describe('SectionPlugin', (): void => {
    it('Create', (done): void => {
        config.load().then((): void => {
            plugin.init(config.getOptions() as SectionConfig);

            expect(context.sections.size).toBe(6);
            expect(context.sections.has('Bug Fixes')).toBeTruthy();
            expect(context.sections.has('Features')).toBeTruthy();
            expect(context.sections.has('Internal сhanges')).toBeTruthy();
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
