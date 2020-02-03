import { ChangeLevel } from '../../config/Config';
import Author from '../../entities/Author';
import Commit, { CommitStatus } from '../../entities/Commit';
import Section, { SectionPosition } from '../../entities/Section';
import MockWriter from '../__mocks__/Writer.mock';

const login = 'keindev';
const commitUrl = 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f';
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
const hash = 'b816518030dace1b91838ae0abd56fa88eba19f';
const author = new Author({ login, url: `https://github.com/${login}`, avatar });

describe('Writer', () => {
    describe('Write sections', () => {
        it('Sections structure will correctly written', done => {
            const writer = new MockWriter();
            const section1 = new Section('Section 1', SectionPosition.Body);
            const section2 = new Section('Section 2', SectionPosition.Body);
            const section3 = new Section('Section 3', SectionPosition.Header);

            const commit1 = new Commit({
                hash: `${hash}1`,
                author,
                timestamp: 1,
                header: 'feat(Section1): subject1',
                url: `${commitUrl}1`,
            });
            const commit2 = new Commit({
                hash: `${hash}2`,
                author,
                timestamp: 2,
                header: 'fix(Section2): subject2__',
                url: `${commitUrl}2`,
            });
            const commit3 = new Commit({
                author,
                hash: `${hash}3`,
                timestamp: 3,
                header: 'feat(Scope1): subject3',
                url: `${commitUrl}3`,
            });
            const commit4 = new Commit({
                author,
                hash: `${hash}4`,
                timestamp: 4,
                header: 'feat(Scope1): subject3',
                url: `${commitUrl}4`,
            });

            commit1.addAccent('Section1');
            commit1.setChangeLevel(ChangeLevel.Minor);
            commit1.setStatus(CommitStatus.Important);
            commit2.addAccent('Section2');
            commit2.setChangeLevel(ChangeLevel.Major);
            commit3.addAccent('Scope1');
            commit3.setChangeLevel(ChangeLevel.Patch);
            commit4.addAccent('Scope1');
            commit4.addAccent('Scope2');
            commit4.setChangeLevel(ChangeLevel.Patch);

            section1.add(commit1);
            section1.add(section2);
            section2.add(commit2);
            section3.add(commit3);
            section3.add(commit4);

            writer.write([section1, section3], [author]).then(() => {
                // eslint-disable-next-line no-underscore-dangle
                expect(writer.__filePath()).toBeDefined();
                // eslint-disable-next-line no-underscore-dangle
                expect(writer.__getData()).toMatchSnapshot();

                done();
            });
        });
    });
});
