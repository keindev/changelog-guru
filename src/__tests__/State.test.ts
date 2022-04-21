import { Config, Exclusion } from '../core/Config.js';
import Author from '../core/entities/Author.js';
import Commit from '../core/entities/Commit.js';
import { ChangeLevel } from '../core/entities/Entity.js';
import { ISection, SectionPosition } from '../core/entities/Section.js';
import State from '../core/State.js';

describe('State', () => {
  const config = new Config();
  const getCommitBase = ((): ((timestamp?: number) => { hash: string; timestamp: number; url: string }) => {
    let i = 0;

    return (timestamp = i) => ({
      hash: `779ed9b4803da533c1d55f26e5cc7d58ff3d47b${i}`,
      url: `https://github.com/keindev/changelog-guru/commit/779ed9b4803da533c1d55f26e5cc7d58ff3d47b${i++}`,
      timestamp,
    });
  })();
  let state: State;

  beforeAll(async () => {
    await config.init();
  });

  beforeEach(() => {
    state = new State('MIT');
  });

  it('Build state tree', () => {
    const avatar = 'https://avatars.githubusercontent.com/u/4527292?v=4';
    const url = 'https://github.com/keindev';
    const author1 = new Author({ login: 'dev1', url, avatar });
    const author2 = new Author({ login: 'dev2', url, avatar });
    const author3 = new Author({ login: 'dependabot-preview[bot]', url, avatar });
    const commit1 = new Commit({ ...getCommitBase(0), author: author2, headline: 'feat(State): message1' });
    const commit2 = new Commit({ ...getCommitBase(0), author: author1, headline: 'test(State): message2' });
    const commit3 = new Commit({ ...getCommitBase(0), author: author1, headline: 'test(State): message3' });
    const commit4 = new Commit({ ...getCommitBase(0), author: author3, headline: 'build(deps): ignore this message' });
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
    const avatar = 'https://avatars.githubusercontent.com/u/4527292?v=4';
    const url = 'https://github.com/keindev';
    const bot = new Author({ login: 'bot', url, avatar });
    const author = new Author({ login: 'dev1', url, avatar });

    const A = new Commit({ ...getCommitBase(), author, headline: 'feat(AAA): AAA' });
    const B = new Commit({ ...getCommitBase(), author, headline: 'fix(BBB): BBB' });
    const C = new Commit({ ...getCommitBase(), author, headline: 'fix(CCC): CCC' });
    const D = new Commit({ ...getCommitBase(), author: bot, headline: 'build(DDD): DDD' });

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
