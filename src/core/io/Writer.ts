import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import Section from '../entities/Section';
import Commit from '../entities/Commit';
import Author from '../entities/Author';
import * as md from '../../utils/Markdown';
import Message from '../entities/Message';
import { findSame } from '~/utils/Text';

const render = (commits: Commit[]): string[] => {
    const groups = new Map<string, Commit[]>();

    commits.forEach(commit => {
        const key = findSame(commit.subject, [...groups.keys()]);

        if (key) {
            const group = groups.get(key);

            if (Array.isArray(group)) {
                group.push(commit);
            } else {
                groups.set(commit.subject, [commit]);
            }
        }
    });

    return [...groups.values()].map(group => {
        const output: string[] = [];
        const accents = new Set<string>();
        const links: string[] = [];

        group.forEach(commit => {
            commit.accents.forEach(accents.add);
            links.push(md.commitLink(commit.name.substr(0, 7), commit.url));
        });

        if (accents.size) output.push(md.strong(`[${[...accents.values()].map(md.capitalize).join(', ')}]`));

        output.push(md.capitalize(group[0].subject), ...links);

        return md.list(output.join(' '));
    });
};

export default class Writer {
    async write(sections: Section[], authors: Author[]): Promise<void> {
        const task = TaskTree.add('Writing new changelog...');
        const data = sections.map(subsection => this.render(subsection));

        data.push(md.contributors(authors.map(md.authorLink)), '');
        await fs.promises.writeFile(path.resolve(process.cwd(), 'CHANGELOG.md'), data);
        task.complete('Changelog generated!');
    }

    private render(section: Section, level = 1): string {
        const sections = section.sections.filter(Section.filter);
        const commits = section.commits.filter(Commit.filter);
        const messages = section.messages.filter(Message.filter);
        const output = [md.title(section.name, level)];

        if (messages.length) output.push(...messages.map(message => message.text), '');

        if (sections.length) {
            output.push(...sections.map(subsection => this.render(subsection, level + 1)));

            if (commits.length) output.push(md.title('Others', level + 1));
        }

        if (commits.length) output.push(...render(commits), '');

        return output.join('\n');
    }
}
