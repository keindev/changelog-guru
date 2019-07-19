import fs from 'fs';
import path from 'path';
import findupSync from 'findup-sync';
import { TaskTree } from 'tasktree-cli';
import { Commit } from '../entities/commit';
import { Author } from '../entities/author';

const $tasks = TaskTree.tree();

export enum ServiceProvider {
    GitHub = 'github',
    GitLab = 'gitlab',
}

export abstract class Provider {
    public static PAGE_SIZE: number = 100;
    public static TYPE: string = 'git';

    public readonly type: ServiceProvider;

    protected repository: string;
    protected owner: string;
    protected branch: string = 'master';

    public constructor(type: ServiceProvider, url: string) {
        const pathname = new URL(url).pathname.split('/');

        this.type = type;
        this.repository = path.basename(pathname.pop() as string, `.${Provider.TYPE}`);
        this.owner = pathname.pop() as string;

        const pattern = `.${Provider.TYPE}/HEAD`;
        const filePath = findupSync(pattern, { cwd: process.cwd() });
        const task = $tasks.add('Initializing git provider');

        if (filePath && fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const match = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                [, this.branch] = match;
            } else {
                task.warn(`${pattern} - ref(s) SHA not found`);
            }
        } else {
            task.warn(`${pattern} - does not exist`);
        }

        task.log(`Provider: ${this.type}`);
        task.log(`Repository: ${this.repository}`);
        task.log(`Branch: ${this.branch}`);
        task.log(`Owner: ${this.owner}`);
        task.complete('Git provider:');
    }

    abstract async getCommits(date: string, page: number): Promise<[Commit, Author][]>;
    abstract async getVersion(): Promise<string | undefined>;
    abstract async getLatestReleaseDate(): Promise<string>;
}
