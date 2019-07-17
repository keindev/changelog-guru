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
    public static LINE_SEPARATOR = '\n';
    public static ITEM_SEPARATOR = ', ';
    public static WORD_SEPARATOR = ' ';

    private data: string[] = [];
    private filePath: string;

    public constructor() {
        this.filePath = path.resolve(process.cwd(), Writer.FILE_NAME);
    }

    private static renderCommitAccents(accents: string[]): string {
        const result: string[] = [];

        accents.forEach((accent: string): void => {
            result.push(Markdown.capitalize(accent));
        });

        return Markdown.bold(`[${result.join(Writer.ITEM_SEPARATOR)}]`);
    }

    public async write(authors: Author[], sections: Section[]): Promise<void> {
        const task = $tasks.add('Writing new changelog...');

        this.data = [];
        sections.forEach((section): void => {
            this.renderSection(section, Markdown.DEFAULT_HEADER_LEVEL);
        });
        this.renderAuthors(authors);
        await fs.promises.writeFile(this.filePath, this.data.join(Writer.WORD_SEPARATOR));
        task.complete('Changelog updated!');
    }

    private renderSection(section: Section, level: number): void {
        const { data } = this;
        const sections = section.getSections();
        const commits = section.getCommits(true, true);

        data.push(Markdown.title(section.title, level));

        if (sections.length) {
            sections.reverse().forEach((item): void => {
                this.renderSection(item, level + 1);
            });

            if (commits.length) data.push(Markdown.title('Others', level + 1));
        }

        if (commits.length) {
            const groups: Map<string, Commit | Commit[]> = new Map();
            let group: Commit | Commit[] | undefined;

            commits.forEach((commit): void => {
                group = Key.inMap(commit.subject, groups);

                if (group) {
                    if (Array.isArray(group)) {
                        group.push(commit);
                    } else {
                        groups.set(group.subject, [group, commit]);
                    }
                } else {
                    groups.set(commit.subject, commit);
                }
            });
            groups.forEach((item): void => {
                if (Array.isArray(item)) {
                    this.renderMirrorCommits(item);
                } else {
                    this.renderCommit(item);
                }
            });
        }
    }

    private renderMirrorCommits(commits: Commit[]): void {
        const result: string[] = [];
        const accents: Set<string> = new Set();
        const links: string[] = [];

        commits.forEach((commit): void => {
            commit.getAccents().forEach((accent): void => {
                accents.add(accent);
            });

            links.push(Markdown.link(Markdown.wrap(commit.getShortHash()), commit.url));
        });

        if (accents.size) result.push(Writer.renderCommitAccents([...accents.values()]));

        result.push(Markdown.capitalize(commits[0].subject), ...links);
        this.data.push(Markdown.listItem(result.join(Writer.WORD_SEPARATOR)));
    }

    private renderCommit(commit: Commit): void {
        const result: string[] = [];
        const accents = commit.getAccents();

        if (accents.length) result.push(Writer.renderCommitAccents(accents));

        result.push(
            Markdown.capitalize(commit.subject),
            Markdown.link(Markdown.wrap(commit.getShortHash()), commit.url)
        );

        this.data.push(Markdown.listItem(result.join(Writer.WORD_SEPARATOR)));
    }

    private renderAuthors(authors: Author[]): void {
        const { data } = this;

        data.push(Markdown.line(), Markdown.title('Contributors'));
        data.push(
            authors
                .map((author): string => Markdown.imageLink(author.getName(), author.getAvatar(), author.url))
                .join(Writer.WORD_SEPARATOR)
        );
    }
}
