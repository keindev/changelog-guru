import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import State from '../entities/state';
import Package from '../entities/package';
import Version from '../utils/version';
import Section from '../entities/section';
import Markdown from '../utils/markdown';
import Commit from '../entities/commit';
import Author from '../entities/author';
import { Status } from '../utils/enums';

const $tasks = TaskTree.tree();

export default class Writer {
    public static FILE_NAME = 'CHANGELOG.md';
    public static LINE_DELIMITER = '\n';

    private pkg: Package;

    public constructor(pkg: Package) {
        this.pkg = pkg;
    }

    private static renderAuthors(authors: Author[]): string {
        const result: string[] = authors.map((author): string =>
            Markdown.link(Markdown.image(author.toString(), author.getAvatar()), author.url)
        );

        return [Markdown.title('Contributors'), result.join('')].join(Writer.LINE_DELIMITER);
    }

    private static renderSection(section: Section, level: number): string {
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
                        .filter((commit): boolean => !commit.hasStatus(Status.Hidden))
                        .map(Writer.renderCommit)
                )
            );
        }

        return result.join(Writer.LINE_DELIMITER);
    }

    private static renderCommit(commit: Commit): string {
        const result: string[] = [];
        const accents = commit.getAccents();

        if (accents.length) {
            result.push(...accents.map((a): string => Markdown.bold(`[${Markdown.capitalize(a)}]`)));
        }

        result.push(
            Markdown.capitalize(commit.subject),
            ' ',
            // tasks
            ' ',
            Markdown.link(Markdown.code(commit.getShortHash()), commit.url)
        );

        return result.join('');
    }

    public async write(state: State): Promise<void> {
        const task = $tasks.add('Write changelog');
        const authors = state.getAuthors();
        const data = state.getSections().map((s): string => Writer.renderSection(s, Markdown.DEFAULT_HEADER_LEVEL));

        data.push(Markdown.line(), Writer.renderAuthors(authors));

        await fs.promises.writeFile(path.resolve(process.cwd(), Writer.FILE_NAME), data.join(Writer.LINE_DELIMITER));
        await this.updatePackage(state, task);

        task.complete();
    }

    private async updatePackage(state: State, task: Task): Promise<void> {
        const { pkg } = this;
        const v1 = state.getVersion();
        const v2 = pkg.getVersion();
        const subtask = task.add(`Update package version to ${chalk.bold(v1)}`);

        if (!v2 || Version.greaterThan(v1, v2)) {
            await pkg.update(v1);
            subtask.complete();
        } else {
            subtask.skip(`Current package version is greater (${chalk.bold(v2)})`);
        }
    }
}
