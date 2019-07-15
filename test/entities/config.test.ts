import { Task } from 'tasktree-cli/lib/task';
import { Configuration } from '../../src/entities/configuration';
import { FilterType, Level } from '../../src/utils/enums';

describe('Config', (): void => {
    it('Create & load', (done): void => {
        const config = new Configuration();
        const task = new Task('test configuration loading');

        config.load(task).then((): void => {
            expect(config.getOptions()).toMatchSnapshot();

            expect(config.getFilters(FilterType.AuthorLogin)).toStrictEqual(['dependabot-preview[bot]']);
            expect(config.getFilters(FilterType.CommitType)).toStrictEqual(['build']);
            expect(config.getFilters(FilterType.CommitScope)).toStrictEqual(['deps', 'deps-dev']);
            expect(config.getFilters(FilterType.CommitSubject)).toStrictEqual(['merge']);

            expect(config.getLevel('break')).toBe(Level.Major);
            expect(config.getLevel('feat')).toBe(Level.Minor);
            expect(config.getLevel('fix')).toBe(Level.Patch);
            expect(config.getLevel('chore')).toBe(Level.Patch);
            expect(config.getLevel('refactor')).toBe(Level.Patch);
            expect(config.getLevel('test')).toBe(Level.Patch);
            expect(config.getLevel('docs')).toBe(Level.Patch);
            expect(config.getLevel('build')).toBe(Level.Patch);
            expect(config.getLevel('types')).toBe(Level.Patch);
            expect(config.getLevel('style')).toBe(Level.Patch);
            expect(config.getLevel('workflow')).toBe(Level.Patch);
            expect(config.getLevel('perf')).toBe(Level.Patch);
            expect(config.getLevel('revert')).toBe(Level.Patch);
            expect(config.getLevel('any')).toBe(Level.Patch);

            expect(config.getPlugins()).toStrictEqual(['marker', 'scope', 'section']);
            expect(config.getProvider()).toBe('github');
            expect(task.isPending()).toBeTruthy();

            done();
        });
    });
});
