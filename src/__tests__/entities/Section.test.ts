import faker from 'faker';

import Author from '../../core/entities/Author';
import Commit from '../../core/entities/Commit';
import { ChangeLevel, Compare, Priority } from '../../core/entities/Entity';
import Message from '../../core/entities/Message';
import Section, { SectionOrder, SectionPosition } from '../../core/entities/Section';

describe('Section', () => {
  const login = faker.internet.userName();
  let section: Section;
  let message: Message;
  let author: Author;
  let commit: Commit;

  beforeEach(() => {
    section = new Section(faker.lorem.word(), SectionPosition.Body);
    message = new Message(faker.lorem.words());
    author = new Author({
      login,
      avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
      url: `https://github.com/${login}`,
    });
    commit = new Commit({
      author,
      hash: 'b816518030dace1b91838ae0abd56fa88eba19f',
      timestamp: faker.random.number(),
      body: '\n\nbody\n\nfooter',
      url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
      headline: 'feat(Jest): subject',
    });
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

      commit.level = ChangeLevel.Major;
      expect(Section.compare(a, b)).toBe(Compare.Less);

      a.remove(commit);
      b.order = SectionOrder.Min;
      expect(a.order).toBe(SectionOrder.Default);
      expect(b.order).toBe(SectionOrder.Min);
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
      section.position = SectionPosition.Body;
      expect(section.position).toBe(SectionPosition.Body);

      section.position = SectionPosition.Footer;
      expect(section.position).toBe(SectionPosition.Footer);

      section.position = SectionPosition.Group;
      expect(section.position).toBe(SectionPosition.Group);

      section.position = SectionPosition.Header;
      expect(section.position).toBe(SectionPosition.Header);

      section.position = SectionPosition.Subsection;
      expect(section.position).toBe(SectionPosition.Subsection);
    });

    it('Entities are added and removed from the section', () => {
      const subsection = new Section('title', SectionPosition.Body);

      section.add(subsection);
      expect(section.sections).toStrictEqual([subsection]);
      expect(section.priority).toBe(Priority.Low + subsection.priority);

      section.add(commit);
      expect(section.commits).toStrictEqual([commit]);
      expect(section.priority).toBe(Priority.Low + subsection.priority + commit.priority);

      section.add(message);
      expect(section.messages).toStrictEqual([message]);
      expect(section.priority).toBe(Priority.Low + subsection.priority + commit.priority + message.priority);

      section.remove(message);
      expect(section.messages).toStrictEqual([]);
      expect(section.priority).toBe(Priority.Low + subsection.priority + commit.priority);

      section.remove(commit);
      expect(section.commits).toStrictEqual([]);
      expect(section.priority).toBe(Priority.Low + subsection.priority);

      section.remove(subsection);
      expect(section.sections).toStrictEqual([]);
      expect(section.priority).toBe(Priority.Low);
    });
  });

  describe('Relations', () => {
    it('Relations of sectionsRelations between sections of the same level are built correctly', () => {
      const relations: Map<string, Section> = new Map();

      section.add(commit);
      section.assign(relations);

      expect(section.commits).toStrictEqual([commit]);
      expect(relations.size).toBe(1);
      expect(relations.get(commit.name)).toStrictEqual(section);

      section.assign(relations);

      expect(section.commits).toStrictEqual([]);
      expect(relations.size).toBe(1);
      expect(relations.get(commit.name)).toStrictEqual(section);
    });

    it('Relations between subsections are built correctly', () => {
      const subsection = new Section(faker.lorem.word(), SectionPosition.Body);
      const relations: Map<string, Section> = new Map();

      section.add(commit);
      subsection.add(commit);
      relations.set(commit.name, section);
      subsection.assign(relations, SectionPosition.Subsection);

      expect(section.sections).toStrictEqual([subsection]);
      expect(section.commits).toStrictEqual([]);
      expect(subsection.commits).toStrictEqual([commit]);
    });
  });
});
