import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import State from '../entities/state';
import Package from '../entities/package';
import Process from '../utils/process';
import Version from '../utils/version';
import Task from '../utils/task';
import Section from '../entities/section';
import Markdown from '../utils/markdown';
import Commit, { Status } from '../entities/commit';
import Author from '../entities/author';

const $process = Process.getInstance();

export default class Writer {
    public static FILE_NAME = 'CHANGELOG.md';
    public static LINE_DELIMITER = '\n';

    public static async write(state: State, pkg: Package): Promise<void> {
        const task = $process.task('Write changelog');

        await Writer.updatePackage(state, pkg, task);
        await Writer.writeChangelog(state.getAuthors(), state.getSections());

        task.complete();
    }

    private static async writeChangelog(authors: Author[], sections: Section[]): Promise<void> {
        const filePath = path.resolve(process.cwd(), Writer.FILE_NAME);
        const data = sections.map((s): string => Writer.renderSection(s, Markdown.DEFAULT_HEADER_LEVEL));

        if (authors.length) data.push(Markdown.line(), Writer.renderAuthors(authors));

        await fs.promises.writeFile(filePath, data.join(Writer.LINE_DELIMITER));
    }

    public static renderAuthors(authors: Author[]): string {
        const result: string[] = authors.map(
            (author): string => Markdown.link(Markdown.image(author.toString(), author.getAvatar()), author.url)
        );

        return [Markdown.title('Contributors'), result.join('')].join(Writer.LINE_DELIMITER);
    }

    public static renderSection(section: Section, level: number): string {
        const result: string[] = [Markdown.title(section.title, level)];
        const sections = section.getSections();
        const commits = section.getCommits();

        if (sections.length) {
            result.push(
                ...sections.reverse().map((s): string => Writer.renderSection(s, level + 1)),
                Markdown.title('Others', level + 1)
            );
        }

        if (commits.length) {
            result.push(
                Markdown.list(
                    commits
                        .sort(Commit.compare)
                        .filter((commit): boolean => !commit.checkStatus(Status.Hidden))
                        .map(Writer.renderCommit)
                )
            );
        }

        return result.join(Writer.LINE_DELIMITER);
    }

    public static renderCommit(commit: Commit): string {
        const result: string[] = [];
        const accents = commit.getAccents();

        if (accents.length) {
            result.push(...accents.map((a): string => Markdown.bold(`[${Markdown.capitalize(a)}]`)));
        }

        result.push(
            Markdown.capitalize(commit.title),
            ' ',
            // tasks
            ' ',
            Markdown.link(Markdown.code(commit.getShotSHA()), commit.url)
        );

        return result.join('');
    }

    private static async updatePackage(state: State, pkg: Package, task: Task): Promise<void> {
        const v1 = state.getVersion();
        const v2 = pkg.getVersion();
        const subtask = task.add(`Update package version to ${chalk.bold(v1)}`);

        if (Version.greaterThan(v1, v2)) {
            pkg.update(v1);
            subtask.complete();
        } else {
            subtask.skip('Current package version is geater');
        }
    }
}
