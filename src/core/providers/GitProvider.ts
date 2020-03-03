import fs from 'fs';
import path from 'path';
import { PackageJson } from 'read-pkg';
import { getUserAgent } from 'universal-user-agent';
import findupSync from 'findup-sync';
import { TaskTree } from 'tasktree-cli';
import Commit from '../entities/Commit';

export enum ServiceProvider {
    GitHub = 'github',
    GitLab = 'gitlab',
}

export interface IRelease {
    tag: string | undefined;
    date: Date;
}

export default abstract class GitProvider {
    readonly type: ServiceProvider;
    readonly pageSize = 100;

    protected repository: string;
    protected owner: string;
    protected branch = 'master';
    protected version = process.env.npm_package_version;
    protected userAgent: string;

    constructor(type: ServiceProvider, url: string, branch?: string) {
        const task = TaskTree.add('Initializing git provider');
        const pathname = new URL(url).pathname.split('/');

        this.type = type;
        this.repository = path.basename(pathname.pop() as string, '.git');
        this.owner = pathname.pop() as string;
        this.userAgent = `changelog-guru/${this.version} ${getUserAgent()}`;

        if (branch) {
            this.branch = branch;
        } else {
            const filePath = findupSync('.git/HEAD', { cwd: process.cwd() });

            if (filePath && fs.existsSync(filePath)) {
                const buffer = fs.readFileSync(filePath);
                const match = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

                if (match) {
                    [, this.branch] = match;
                } else {
                    task.warn(`{bold .git/HEAD} - ref(s) SHA not found`);
                }
            } else {
                task.warn(`{bold .git/HEAD} - does not exist`);
            }
        }

        task.log(`Provider: {bold ${this.type}}`);
        task.log(`Repository: {bold ${this.repository}}`);
        task.log(`Branch: {bold ${this.branch}}`);
        task.log(`Owner: {bold ${this.owner}}`);
        task.complete('Git provider:');
    }

    abstract async getLastRelease(): Promise<IRelease>;
    abstract async getCommits(date: Date, page: number): Promise<Commit[]>;
    abstract async getCommitsCount(date: Date): Promise<number>;
    abstract async getPrevPackage(): Promise<PackageJson>;
}
