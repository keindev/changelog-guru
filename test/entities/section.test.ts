import Section, { Position } from '../../src/entities/section';
import { Priority, Compare } from '../../src/utils/enums';
import Commit from '../../src/entities/commit';

const TITLE = 'test title';

describe('Section', (): void => {
    it('Create', (): void => {
        const section = new Section(TITLE, Position.Body);

        expect(section.title).toBe(TITLE);
        expect(section.getPosition()).toBe(Position.Body);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getCommits().length).toBe(0);
        expect(section.getSections().length).toBe(0);
        expect(section.isEmpty()).toBeTruthy();
    });

    it('Change position', (): void => {
        const section = new Section(TITLE, Position.Body);

        section.setPosition(Position.Body);
        expect(section.getPosition()).toBe(Position.Body);

        section.setPosition(Position.Footer);
        expect(section.getPosition()).toBe(Position.Footer);

        section.setPosition(Position.Group);
        expect(section.getPosition()).toBe(Position.Group);

        section.setPosition(Position.Header);
        expect(section.getPosition()).toBe(Position.Header);

        section.setPosition(Position.Subsection);
        expect(section.getPosition()).toBe(Position.Subsection);
    });

    it('Assign and remove entities', (): void => {
        const section = new Section(TITLE, Position.Body);
        const subsection = new Section(TITLE, Position.Body);
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 0,
            message: `feat(test): message`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        section.assign(subsection);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getSections()).toStrictEqual([subsection]);

        section.assign(commit);
        expect(section.getPriority()).toBe(Priority.Default + commit.getPriority());
        expect(section.getCommits()).toStrictEqual([commit]);

        section.remove(subsection);
        expect(section.getPriority()).toBe(Priority.Default + commit.getPriority());
        expect(section.getSections()).toStrictEqual([]);

        section.remove(commit);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getCommits()).toStrictEqual([]);
    });

    it('Sections compare', (): void => {
        const section1 = new Section('a', Position.Body);
        const section2 = new Section('b', Position.Body);

        expect(Section.compare(section1, section2)).toBe(Compare.Less);
        expect(Section.compare(section2, section1)).toBe(Compare.More);
        expect(Section.compare(section1, section1)).toBe(Compare.Equal);
    });
});
