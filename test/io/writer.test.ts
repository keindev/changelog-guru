import { MockWriter } from '../__mocks__/io/writer.mock';
import { Section, Position } from '../../src/entities/section';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { Level, Status } from '../../src/utils/enums';

describe('Writer', (): void => {
    it('Default', (done): void => {
        const writer = new MockWriter();
        const section1 = new Section('Section 1', Position.Body);
        const section2 = new Section('Section 2', Position.Body);
        const section3 = new Section('Section 3', Position.Header);
        const author = new Author(1, {
            login: 'keindev',
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
        const commit1 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 1,
            message: `feat(Section1): subject1`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: 'keindev',
        });
        const commit2 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
            timestamp: 2,
            message: `fix(Section2): subject2`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            author: 'keindev',
        });
        const commit3 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
            timestamp: 3,
            message: `feat(Scope1): subject3`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f3',
            author: 'keindev',
        });
        const commit4 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
            timestamp: 4,
            message: `feat(Scope1): subject3`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f4',
            author: 'keindev',
        });

        commit1.addAccent('Section1');
        commit1.setLevel(Level.Minor);
        commit1.setStatus(Status.Important);
        commit2.addAccent('Section2');
        commit2.setLevel(Level.Major);
        commit3.addAccent('Scope1');
        commit3.setLevel(Level.Patch);
        commit4.addAccent('Scope1');
        commit4.addAccent('Scope2');
        commit4.setLevel(Level.Patch);

        section1.add(commit1);
        section1.add(section2);
        section2.add(commit2);
        section3.add(commit3);
        section3.add(commit4);

        writer.write([author], [section1, section3]).then((): void => {
            // eslint-disable-next-line no-underscore-dangle
            expect(writer.__filePath()).toBeDefined();
            // eslint-disable-next-line no-underscore-dangle
            expect(writer.__getData()).toMatchSnapshot();

            done();
        });
    });
});
