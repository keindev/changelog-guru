import Section, { Position } from '../../src/entities/section';
import { Priority, Compare } from '../../src/utils/enums';
import Commit from '../../src/entities/commit';

describe('Section', (): void => {
    it('Create', (): void => {
        const section = new Section('title', Position.Body);

        expect(section.title).toBe('title');
        expect(section.getPosition()).toBe(Position.Body);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getCommits().length).toBe(0);
        expect(section.getSections().length).toBe(0);
        expect(section.isEmpty()).toBeTruthy();
    });

    it('Change position', (): void => {
        const section = new Section('title', Position.Body);

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
        const section = new Section('title 1', Position.Body);
        const subsection = new Section('title 2', Position.Body);
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 0,
            message: `feat(test): message`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        section.add(subsection);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getSections()).toStrictEqual([subsection]);

        section.add(commit);
        expect(section.getPriority()).toBe(Priority.Default + commit.getPriority());
        expect(section.getCommits()).toStrictEqual([commit]);

        section.remove(subsection);
        expect(section.getPriority()).toBe(Priority.Default + commit.getPriority());
        expect(section.getSections()).toStrictEqual([]);

        section.remove(commit);
        expect(section.getPriority()).toBe(Priority.Default);
        expect(section.getCommits()).toStrictEqual([]);
    });

    it('Compare', (): void => {
        const section1 = new Section('a', Position.Body);
        const section2 = new Section('b', Position.Body);

        expect(Section.compare(section1, section2)).toBe(Compare.Less);
        expect(Section.compare(section2, section1)).toBe(Compare.More);
        expect(Section.compare(section1, section1)).toBe(Compare.Equal);
    });

    it('Filter', (): void => {
        const section1 = new Section('a', Position.Subsection);
        const section2 = new Section('b', Position.Body);
        const section3 = new Section('c', Position.Body);
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 0,
            message: `feat(test): message`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        section3.add(commit);

        expect(Section.filter(section1)).toBeFalsy();
        expect(Section.filter(section2)).toBeFalsy();
        expect(Section.filter(section3)).toBeTruthy();
    });

    it('Relations of sections', (): void => {
        const section = new Section('a', Position.Body);
        const relations: Map<string, Section> = new Map();
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 0,
            message: `feat(test): message`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        section.add(commit);
        section.assignAsSection(relations);

        expect(section.getCommits()).toStrictEqual([commit]);
        expect(relations.size).toBe(1);
        expect(relations.get(commit.hash)).toStrictEqual(section);

        section.assignAsSection(relations);
        expect(section.getCommits()).toStrictEqual([]);
        expect(relations.size).toBe(1);
        expect(relations.get(commit.hash)).toStrictEqual(section);
    });

    it('Relations of subsections', (): void => {
        const section = new Section('a', Position.Body);
        const subsection = new Section('b', Position.Body);
        const relations: Map<string, Section> = new Map();
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 0,
            message: `feat(test): message`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        section.add(commit);
        subsection.add(commit);
        relations.set(commit.hash, section);
        subsection.assignAsSubsection(relations);

        expect(section.getSections()).toStrictEqual([subsection]);
        expect(section.getCommits()).toStrictEqual([]);
        expect(subsection.getCommits()).toStrictEqual([commit]);
    });
});
