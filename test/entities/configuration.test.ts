import { Task } from 'tasktree-cli/lib/task';
import { Configuration } from '../../src/entities/configuration';
import { FilterType, Level } from '../../src/utils/enums';

describe('Config', (): void => {
    it('Default', (done): void => {
        const config = new Configuration();
        const task = new Task('test configuration loading');

        config.load(task).then((): void => {
            expect(config.getOptions()).toMatchSnapshot();

            expect(config.getFilters(FilterType.AuthorLogin)).toStrictEqual(['dependabot-preview[bot]']);
            expect(config.getFilters(FilterType.CommitType)).toStrictEqual(['build']);
            expect(config.getFilters(FilterType.CommitScope)).toStrictEqual(['deps', 'deps-dev']);
            expect(config.getFilters(FilterType.CommitSubject)).toStrictEqual(['merge']);

            const levels = config.getLevels();

            expect(levels.get('break')).toBe(Level.Major);
            expect(levels.get('feat')).toBe(Level.Minor);
            expect(levels.get('fix')).toBe(Level.Patch);
            expect(levels.get('chore')).toBe(Level.Patch);
            expect(levels.get('refactor')).toBe(Level.Patch);
            expect(levels.get('test')).toBe(Level.Patch);
            expect(levels.get('docs')).toBe(Level.Patch);
            expect(levels.get('build')).toBe(Level.Patch);
            expect(levels.get('types')).toBe(Level.Patch);
            expect(levels.get('style')).toBe(Level.Patch);
            expect(levels.get('workflow')).toBe(Level.Patch);
            expect(levels.get('perf')).toBe(Level.Patch);
            expect(levels.get('revert')).toBe(Level.Patch);

            expect(config.getPlugins()).toStrictEqual(['attention', 'marker', 'scope', 'section']);
            expect(config.getProvider()).toBe('github');
            expect(task.isPending()).toBeTruthy();

            done();
        });
    });
});
