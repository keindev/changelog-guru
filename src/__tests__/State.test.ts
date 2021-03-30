import faker from 'faker';

import { Config, Exclusion } from '../core/Config';
import Author from '../core/entities/Author';
import Commit from '../core/entities/Commit';
import { ChangeLevel } from '../core/entities/Entity';
import { ISection, SectionPosition } from '../core/entities/Section';
import State from '../core/State';

describe('State', () => {
  const config = new Config();
  let state: State;

  beforeAll(async () => {
    await config.init();
  });

  beforeEach(() => {
    state = new State('MIT');
  });

  it('Build state tree', async () => {
    const author1 = new Author({ login: 'dev1', url: faker.internet.url(), avatar: faker.internet.avatar() });
    const author2 = new Author({ login: 'dev2', url: faker.internet.url(), avatar: faker.internet.avatar() });
    const author3 = new Author({
      login: 'dependabot-preview[bot]',
      url: faker.internet.url(),
      avatar: faker.internet.avatar(),
    });

    const commit1 = new Commit({
      hash: faker.git.commitSha(),
      author: author2,
      headline: 'feat(State): message1',
      timestamp: 0,
      url: faker.internet.url(),
    });
    const commit2 = new Commit({
      hash: faker.git.commitSha(),
      author: author1,
      headline: 'test(State): message2',
      timestamp: 0,
      url: faker.internet.url(),
    });
    const commit3 = new Commit({
      hash: faker.git.commitSha(),
      author: author1,
      headline: 'test(State): message3',
      timestamp: 0,
      url: faker.internet.url(),
    });
    const commit4 = new Commit({
      hash: faker.git.commitSha(),
      author: author3,
      headline: 'build(deps): ignore this message',
      timestamp: 0,
      url: faker.internet.url(),
    });
    const section1 = state.addSection({ name: 'header section', position: SectionPosition.Header }) as ISection;
    const section2 = state.addSection({ name: 'empty section', position: SectionPosition.Footer }) as ISection;

    expect(section1).toBeDefined();
    expect(section2).toBeDefined();

    state.addCommit(commit2);
    state.addCommit(commit3);
    state.addCommit(commit1);
    state.addCommit(commit4);
    section1.add(commit1);
    state.updateCommitsChangeLevel(config.types);

    expect(state.authors).toStrictEqual([author1, author2, author3]);
    expect(state.commits).toStrictEqual([commit4, commit2, commit3, commit1]);
    expect(state.sections).toStrictEqual([section1, section2]);
    expect(author3.isIgnored).toBeFalsy();
    expect(commit4.isIgnored).toBeFalsy();

    commit1.level = ChangeLevel.Major;
    state.ignore(config.exclusions);

    expect(state.changesLevels).toStrictEqual([1, 0, 3]);
    expect(author3.isIgnored).toBeTruthy();
    expect(commit4.isIgnored).toBeTruthy();
    expect(state.authors).toStrictEqual([author1, author2]);
    expect(state.commits).toStrictEqual([commit2, commit3, commit1]);

    state.modify([]);

    expect(state.sections).toStrictEqual([section1]);
  });

  it('Create sections', () => {
    const section = state.addSection({ name: 'header section', position: SectionPosition.Header });

    expect(section).toBeDefined();
    expect(state.findSection('header section')).toStrictEqual(section);
    expect(state.findSection('')).toBeUndefined();
  });

  it('Filter commits', () => {
    const bot = new Author({
      login: 'bot',
      url: faker.internet.url(),
      avatar: faker.internet.avatar(),
    });
    const author = new Author({
      login: 'dev1',
      url: faker.internet.url(),
      avatar: faker.internet.avatar(),
    });

    const A = new Commit({
      author,
      hash: faker.git.commitSha(),
      timestamp: 1,
      headline: 'feat(AAA): AAA',
      url: faker.internet.url(),
    });

    const B = new Commit({
      author,
      hash: faker.git.commitSha(),
      timestamp: 2,
      headline: 'fix(BBB): BBB',
      url: faker.internet.url(),
    });

    const C = new Commit({
      author,
      hash: faker.git.commitSha(),
      timestamp: 2,
      headline: 'fix(CCC): CCC',
      url: faker.internet.url(),
    });

    const D = new Commit({
      author: bot,
      hash: faker.git.commitSha(),
      timestamp: 2,
      headline: 'build(DDD): DDD',
      url: faker.internet.url(),
    });

    state.addCommit(A);
    state.addCommit(B);
    state.addCommit(C);
    state.addCommit(D);

    state.ignore([[Exclusion.AuthorLogin, ['bot']]]);
    expect(bot.isIgnored).toBeTruthy();
    expect(author.isIgnored).toBeFalsy();

    state.ignore([[Exclusion.CommitType, ['fix']]]);
    expect(A.isIgnored).toBeFalsy();
    expect(B.isIgnored).toBeTruthy();
    expect(C.isIgnored).toBeTruthy();
    expect(D.isIgnored).toBeFalsy();

    state.ignore([[Exclusion.CommitScope, ['AAA']]]);
    expect(A.isIgnored).toBeTruthy();
    expect(B.isIgnored).toBeTruthy();
    expect(C.isIgnored).toBeTruthy();
    expect(D.isIgnored).toBeFalsy();

    state.ignore([[Exclusion.CommitSubject, ['DDD']]]);
    expect(A.isIgnored).toBeTruthy();
    expect(B.isIgnored).toBeTruthy();
    expect(C.isIgnored).toBeTruthy();
    expect(D.isIgnored).toBeTruthy();
  });
});
