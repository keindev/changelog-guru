import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import Section from '../entities/section';
import Markdown from '../utils/markdown';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Key from '../utils/key';

const $tasks = TaskTree.tree();

export default class Writer {
    public static FILE_NAME = 'CHANGELOG.md';
    public static SEPARATOR = '\n';
    public static SPACE = ' ';

    public static async write(authors: Author[], sections: Section[]): Promise<void> {
        const task = $tasks.add('Writing new changelog...');
        const data = sections.map((section): string => Writer.renderSection(section, Markdown.DEFAULT_HEADER_LEVEL));

        data.push(Writer.renderAuthors(authors));

        await fs.promises.writeFile(path.resolve(process.cwd(), Writer.FILE_NAME), data.join(Writer.SEPARATOR));

        task.complete('Changelog updated!');
    }

    private static renderSection(section: Section, level: number): string {
        const result = [Markdown.title(section.title, level)];
        const sections = section.getSections();
        const commits = section.getCommits(true, true);

        if (sections.length) {
            result.push(
                ...sections.reverse().map((item): string => Writer.renderSection(item, level + 1)),
                Markdown.title('Others', level + 1)
            );
        }

        if (commits.length) {
            const uniqueList: Map<string, Commit | Commit[]> = new Map();
            let mirrors: Commit | Commit[] | undefined;

            commits.forEach((commit): void => {
                mirrors = Key.inMap(commit.subject, uniqueList);

                if (mirrors) {
                    if (Array.isArray(mirrors)) {
                        mirrors.push(commit);
                    } else {
                        uniqueList.set(mirrors.subject, [mirrors, commit]);
                    }
                } else {
                    uniqueList.set(commit.subject, commit);
                }
            });

            result.push(
                Markdown.list(
                    [...uniqueList.values()].map((commit): string => {
                        return Array.isArray(commit) ? Writer.renderCommitMirrors(commit) : Writer.renderCommit(commit);
                    })
                )
            );
        }

        return result.join(Writer.SEPARATOR);
    }

    // TODO: refactor and add test
    private static renderCommitMirrors(commits: Commit[]): string {
        const result: string[] = [];
        const accents: Set<string> = new Set();
        const links: string[] = [];

        commits.forEach((commit): void => {
            commit.getAccents().forEach((accent): void => {
                accents.add(accent);
            });

            links.push(Markdown.link(Markdown.wrap(commit.getShortHash()), commit.url));
        });

        if (accents.size) {
            // FIXME: should be [A, B], now [A], [B]
            result.push(...[...accents.values()].map((a): string => Markdown.bold(`[${Markdown.capitalize(a)}]`)));
        }

        result.push(Markdown.capitalize(commits[0].subject), ' ', links.join(' '));

        return result.join('');
    }

    // TODO: refactor and add test
    private static renderCommit(commit: Commit): string {
        const result: string[] = [];
        const accents = commit.getAccents();

        if (accents.length) {
            result.push(Markdown.bold(`[${accents.map((a): string => Markdown.capitalize(a)).join(', ')}]`));
        }

        result.push(
            Markdown.capitalize(commit.subject),
            ' ',
            Markdown.link(Markdown.wrap(commit.getShortHash()), commit.url)
        );

        return result.join('');
    }

    private static renderAuthors(authors: Author[]): string {
        const links: string[] = [];

        authors.forEach((author): void => {
            if (!author.isIgnored()) links.push(Markdown.imageLink(author.getName(), author.getAvatar(), author.url));
        });

        return [Markdown.line(), Markdown.title('Contributors'), links.join(Writer.SPACE)].join(Writer.SEPARATOR);
    }
}
