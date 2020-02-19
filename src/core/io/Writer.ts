import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import Section from '../entities/Section';
import Commit from '../entities/Commit';
import Author from '../entities/Author';
import * as md from '../../utils/Markdown';
import { inMap } from '../../utils/Text';
import Message from '../entities/Message';

export default class Writer {
    static FILE_NAME = 'CHANGELOG.md';

    protected filePath = path.resolve(process.cwd(), Writer.FILE_NAME);

    private static groupCommits(commits: Commit[]): (Commit | Commit[])[] {
        const groups = new Map<string, Commit | Commit[]>();
        let group: Commit | Commit[] | undefined;

        commits.forEach(commit => {
            group = inMap(commit.subject, groups);

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
                links.push(md.commitLink(commit.shortName, commit.url));
            });
        } else {
            subject = group.subject;
            accents.push(...group.accents);
            links.push(md.commitLink(group.shortName, group.url));
        }

        if (accents.length) output.push(md.strong(`[${[...new Set(...accents)].map(md.capitalize).join(', ')}]`));

        output.push(md.capitalize(subject), ...links);

        return md.list(output.join(' '));
    }

    async write(sections: Section[], authors: Author[]): Promise<void> {
        const task = TaskTree.add('Writing new changelog...');
        const data = sections.map(subsection => this.renderSection(subsection));

        data.push(md.contributors(authors.map(md.authorLink)), '');
        await this.writeFile(data.join('\n'));
        task.complete('Changelog generated!');
    }

    protected async writeFile(data: string): Promise<void> {
        await fs.promises.writeFile(this.filePath, data);
    }

    private renderSection(section: Section, level = 1): string {
        const sections = section.sections.filter(Section.filter);
        const commits = section.commits.filter(Commit.filter);
        const messages = section.messages.filter(Message.filter);
        const output = [md.title(section.name, level)];

        if (messages.length) output.push(...messages.map(message => message.text), '');

        if (sections.length) {
            output.push(...sections.map(subsection => this.renderSection(subsection, level + 1)));

            if (commits.length) output.push(md.title('Others', level + 1));
        }

        if (commits.length) output.push(...Writer.groupCommits(commits).map(Writer.renderCommit), '');

        return output.join('\n');
    }
}
