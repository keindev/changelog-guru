import faker from 'faker';
import Section, { SectionPosition, SectionOrder } from '../Section';
import Commit from '../Commit';
import Author from '../Author';
import Message from '../Message';
import { ChangeLevel } from '../../config/Config';
import { Compare, Priority } from '../Entity';

const login = faker.internet.userName();
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
const authorUrl = `https://github.com/${login}`;
const hash = 'b816518030dace1b91838ae0abd56fa88eba19f';
const timestamp = faker.random.number();
const body = '\n\nbody\n\nfooter';
const commitUrl = 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0';
let section: Section;
let message: Message;
let author: Author;
let commit: Commit;

describe('Section', () => {
    beforeEach(() => {
        section = new Section(faker.lorem.word(), SectionPosition.Body);
        message = new Message(faker.lorem.words());
        author = new Author({ login, avatar, url: authorUrl });
        commit = new Commit({ author, hash, timestamp, body, url: commitUrl, header: 'feat(Jest): subject' });
    });

    describe('Static', () => {
        it('Comparison is correct', () => {
            const a = new Section('a', SectionPosition.Body);
            const b = new Section('b', SectionPosition.Body);

            a.add(commit);
            b.add(message);

            expect(Section.compare(a, b)).toBe(Compare.Less);
            expect(Section.compare(b, a)).toBe(Compare.More);
            expect(Section.compare(a, a)).toBe(Compare.Equal);

            commit.setChangeLevel(ChangeLevel.Major);

            expect(Section.compare(a, b)).toBe(Compare.Less);

            a.remove(commit);
            b.setOrder(SectionOrder.Min);

            expect(a.getOrder()).toBe(SectionOrder.Default);
            expect(b.getOrder()).toBe(SectionOrder.Min);
            expect(Section.compare(a, b)).toBe(Compare.More);
        });

        it('Sections is filtered', () => {
            const a = new Section('a', SectionPosition.Body);
            const b = new Section('b', SectionPosition.Subsection);

            b.add(commit);

            expect(Section.filter(a)).toBeFalsy();
            expect(Section.filter(b)).toBeTruthy();

            a.add(message);

            expect(Section.filter(a)).toBeTruthy();
        });
    });

    describe('Section modification', () => {
        it('Position is change', () => {
            section.setPosition(SectionPosition.Body);
            expect(section.getPosition()).toBe(SectionPosition.Body);

            section.setPosition(SectionPosition.Footer);
            expect(section.getPosition()).toBe(SectionPosition.Footer);

            section.setPosition(SectionPosition.Group);
            expect(section.getPosition()).toBe(SectionPosition.Group);

            section.setPosition(SectionPosition.Header);
            expect(section.getPosition()).toBe(SectionPosition.Header);

            section.setPosition(SectionPosition.Subsection);
            expect(section.getPosition()).toBe(SectionPosition.Subsection);
        });

        it('Entities are added and removed from the section', () => {
            const subsection = new Section('title', SectionPosition.Body);

            section.add(subsection);
            expect(section.getSections()).toStrictEqual([subsection]);
            expect(section.getPriority()).toBe(Priority.Low + subsection.getPriority());

            section.add(commit);
            expect(section.getCommits()).toStrictEqual([commit]);
            expect(section.getPriority()).toBe(Priority.Low + subsection.getPriority() + commit.getPriority());

            section.add(message);
            expect(section.getMessages()).toStrictEqual([message]);
            expect(section.getPriority()).toBe(
                Priority.Low + subsection.getPriority() + commit.getPriority() + message.getPriority()
            );

            section.remove(message);
            expect(section.getMessages()).toStrictEqual([]);
            expect(section.getPriority()).toBe(Priority.Low + subsection.getPriority() + commit.getPriority());

            section.remove(commit);
            expect(section.getCommits()).toStrictEqual([]);
            expect(section.getPriority()).toBe(Priority.Low + subsection.getPriority());

            section.remove(subsection);
            expect(section.getSections()).toStrictEqual([]);
            expect(section.getPriority()).toBe(Priority.Low);
        });
    });

    describe('Relations', () => {
        it('Relations of sectionsRelations between sections of the same level are built correctly', () => {
            const relations: Map<string, Section> = new Map();

            section.add(commit);
            section.assignAsSection(relations);

            expect(section.getCommits()).toStrictEqual([commit]);
            expect(relations.size).toBe(1);
            expect(relations.get(commit.getName())).toStrictEqual(section);

            section.assignAsSection(relations);

            expect(section.getCommits()).toStrictEqual([]);
            expect(relations.size).toBe(1);
            expect(relations.get(commit.getName())).toStrictEqual(section);
        });

        it('Relations between subsections are built correctly', () => {
            const subsection = new Section(faker.lorem.word(), SectionPosition.Body);
            const relations: Map<string, Section> = new Map();

            section.add(commit);
            subsection.add(commit);
            relations.set(commit.getName(), section);
            subsection.assignAsSubsection(relations);

            expect(section.getSections()).toStrictEqual([subsection]);
            expect(section.getCommits()).toStrictEqual([]);
            expect(subsection.getCommits()).toStrictEqual([commit]);
        });
    });
});
