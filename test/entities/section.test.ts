import { Section, SectionPosition, SectionOrder } from '../../src/entities/section';
import { Priority, Compare } from '../../src/typings/enums';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { Message } from '../../src/entities/message';
import { ChangeLevel } from '../../src/config/config';

describe('Section', (): void => {
    let $section: Section;
    let $commit: Commit;
    let $message: Message;
    let $author: Author;

    beforeEach((): void => {
        $section = new Section('title', SectionPosition.Body);
        $message = new Message('test');
        $author = new Author('keindev', {
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
        $commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 21,
            header: 'feat(Jest): subject',
            body: '\n\nbody\n\nfooter',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: $author,
        });
    });

    describe('Static', (): void => {
        it('Compare', (): void => {
            const a = new Section('a', SectionPosition.Body);
            const b = new Section('b', SectionPosition.Body);

            a.add($commit);
            b.add($message);

            expect(Section.compare(a, b)).toBe(Compare.Less);
            expect(Section.compare(b, a)).toBe(Compare.More);
            expect(Section.compare(a, a)).toBe(Compare.Equal);

            $commit.setChangeLevel(ChangeLevel.Major);

            expect(Section.compare(a, b)).toBe(Compare.Less);

            a.remove($commit);
            b.setOrder(SectionOrder.Min);

            expect(a.getOrder()).toBe(SectionOrder.Default);
            expect(b.getOrder()).toBe(SectionOrder.Min);
            expect(Section.compare(a, b)).toBe(Compare.More);
        });

        it('Filter', (): void => {
            const a = new Section('a', SectionPosition.Body);
            const b = new Section('b', SectionPosition.Subsection);

            b.add($commit);

            expect(Section.filter(a)).toBeFalsy();
            expect(Section.filter(b)).toBeTruthy();

            a.add($message);

            expect(Section.filter(a)).toBeTruthy();
        });
    });

    it('Default', (): void => {
        expect($section.getPosition()).toBe(SectionPosition.Body);
        expect($section.getCommits().length).toBe(0);
        expect($section.getMessages().length).toBe(0);
        expect($section.getSections().length).toBe(0);
        expect($section.getPriority()).toBe(Priority.Low);
        expect($section.isEmpty()).toBeTruthy();
    });

    it('Change position', (): void => {
        $section.setPosition(SectionPosition.Body);
        expect($section.getPosition()).toBe(SectionPosition.Body);

        $section.setPosition(SectionPosition.Footer);
        expect($section.getPosition()).toBe(SectionPosition.Footer);

        $section.setPosition(SectionPosition.Group);
        expect($section.getPosition()).toBe(SectionPosition.Group);

        $section.setPosition(SectionPosition.Header);
        expect($section.getPosition()).toBe(SectionPosition.Header);

        $section.setPosition(SectionPosition.Subsection);
        expect($section.getPosition()).toBe(SectionPosition.Subsection);
    });

    it('Add and remove entities', (): void => {
        const subsection = new Section('title', SectionPosition.Body);

        $section.add(subsection);
        expect($section.getSections()).toStrictEqual([subsection]);
        expect($section.getPriority()).toBe(Priority.Low + subsection.getPriority());

        $section.add($commit);
        expect($section.getCommits()).toStrictEqual([$commit]);
        expect($section.getPriority()).toBe(Priority.Low + subsection.getPriority() + $commit.getPriority());

        $section.add($message);
        expect($section.getMessages()).toStrictEqual([$message]);
        expect($section.getPriority()).toBe(
            Priority.Low + subsection.getPriority() + $commit.getPriority() + $message.getPriority()
        );

        $section.remove($message);
        expect($section.getMessages()).toStrictEqual([]);
        expect($section.getPriority()).toBe(Priority.Low + subsection.getPriority() + $commit.getPriority());

        $section.remove($commit);
        expect($section.getCommits()).toStrictEqual([]);
        expect($section.getPriority()).toBe(Priority.Low + subsection.getPriority());

        $section.remove(subsection);
        expect($section.getSections()).toStrictEqual([]);
        expect($section.getPriority()).toBe(Priority.Low);
    });

    it('Relations of sections', (): void => {
        const relations: Map<string, Section> = new Map();

        $section.add($commit);
        $section.assignAsSection(relations);

        expect($section.getCommits()).toStrictEqual([$commit]);
        expect(relations.size).toBe(1);
        expect(relations.get($commit.getName())).toStrictEqual($section);

        $section.assignAsSection(relations);

        expect($section.getCommits()).toStrictEqual([]);
        expect(relations.size).toBe(1);
        expect(relations.get($commit.getName())).toStrictEqual($section);
    });

    it('Relations of subsections', (): void => {
        const subsection = new Section('title', SectionPosition.Body);
        const relations: Map<string, Section> = new Map();

        $section.add($commit);
        subsection.add($commit);
        relations.set($commit.getName(), $section);
        subsection.assignAsSubsection(relations);

        expect($section.getSections()).toStrictEqual([subsection]);
        expect($section.getCommits()).toStrictEqual([]);
        expect(subsection.getCommits()).toStrictEqual([$commit]);
    });
});
