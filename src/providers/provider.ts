import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { TaskTree } from 'tasktree-cli';
import findupSync from 'findup-sync';
import Commit from '../entities/commit';
import Author from '../entities/author';

const $tasks = TaskTree.tree();

export enum ProviderName {
    GitHub = 'github',
    // not supported yet
    GitLab = 'gitlab',
}

export default abstract class Provider {
    public static PAGE_SIZE: number = 100;
    public static TYPE: string = 'git';

    protected repository: string;
    protected owner: string;
    protected branch: string = '';

    public constructor(url: string) {
        const pathname: string[] = new URL(url).pathname.split('/');

        this.repository = path.basename(pathname.pop() as string, `.${Provider.TYPE}`);
        this.owner = pathname.pop() as string;

        const pattern = `.${Provider.TYPE}/HEAD`;
        const filePath = findupSync(pattern, { cwd: process.cwd() });
        const task = $tasks.add('Initializing git provider');

        if (fs.existsSync(filePath)) {
            const buffer: Buffer = fs.readFileSync(filePath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                [, this.branch] = match;
            } else {
                task.fail(`${chalk.bold(pattern)} - ref(s) SHA not found`);
            }
        } else {
            task.fail(`${chalk.bold(pattern)} - does not exist`);
        }

        task.log(`Repository: ${chalk.bold(this.repository)}`);
        task.log(`Branch: ${chalk.bold(this.branch)}`);
        task.log(`Owner: ${chalk.bold(this.owner)}`);
        task.complete('Git provider initialized:');
    }

    abstract async getCommits(date: string, page: number): Promise<[Commit, Author][]>;
    abstract async getVersion(): Promise<string | undefined>;
    abstract async getLatestReleaseDate(): Promise<string>;
}
