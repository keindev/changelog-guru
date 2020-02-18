import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import Section from '../entities/Section';
import Commit from '../entities/Commit';
import Author from '../entities/Author';
import Markdown from '../../utils/Markdown';
import Key from '../../utils/Key';
import Message from '../entities/Message';

export default class Writer {
    public static FILE_NAME = 'CHANGELOG.md';

    protected filePath = path.resolve(process.cwd(), Writer.FILE_NAME);

    private static groupCommits(commits: Commit[]): (Commit | Commit[])[] {
        const groups = new Map<string, Commit | Commit[]>();
        let group: Commit | Commit[] | undefined;

        commits.forEach(commit => {
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

        return [...groups.values()];
    }

    private static renderCommit(group: Commit | Commit[]): string {
        const output: string[] = [];
        const accents: string[] = [];
        const links: string[] = [];
        let subject: string;

        if (Array.isArray(group)) {
            subject = group[0].subject;
            group.forEach(commit => {
                accents.push(...commit.accents);
                links.push(Markdown.commitLink(commit.shortName, commit.url));
            });
        } else {
            subject = group.subject;
            accents.push(...group.accents);
            links.push(Markdown.commitLink(group.shortName, group.url));
        }

        if (accents.length) {
            output.push(
                Markdown.bold(`[${[...new Set(...accents)].map(Markdown.capitalize).join(Markdown.ITEM_SEPARATOR)}]`)
            );
        }

        output.push(Markdown.capitalize(subject), ...links);

        return Markdown.listItem(output.join(Markdown.WORD_SEPARATOR));
    }

    private static renderAuthors(authors: Author[]): string {
        return [Markdown.line(), Markdown.title('Contributors'), ...authors.map(Markdown.authorLink)].join(
            Markdown.LINE_SEPARATOR
        );
    }

    public async write(sections: Section[], authors: Author[]): Promise<void> {
        const task = TaskTree.add('Writing new changelog...');
        const data = sections.map(subsection => this.renderSection(subsection));

        data.push(Writer.renderAuthors(authors), Markdown.EMPTY_SEPARATOR);
        await this.writeFile(data.join(Markdown.LINE_SEPARATOR));
        task.complete('Changelog generated!');
    }

    protected async writeFile(data: string): Promise<void> {
        await fs.promises.writeFile(this.filePath, data);
    }

    private renderSection(section: Section, level: number = Markdown.DEFAULT_HEADER_LEVEL): string {
        const sections = section.sections.filter(Section.filter);
        const commits = section.commits.filter(Commit.filter);
        const messages = section.messages.filter(Message.filter);
        const output = [Markdown.title(section.name, level)];

        if (messages.length) output.push(...messages.map(message => message.text), Markdown.EMPTY_SEPARATOR);

        if (sections.length) {
            output.push(...sections.map(subsection => this.renderSection(subsection, level + 1)));

            if (commits.length) output.push(Markdown.title('Others', level + 1));
        }

        if (commits.length) {
            output.push(...Writer.groupCommits(commits).map(Writer.renderCommit), Markdown.EMPTY_SEPARATOR);
        }

        return output.join(Markdown.LINE_SEPARATOR);
    }
}
