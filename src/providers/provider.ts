import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import findupSync from 'findup-sync';
import Commit from '../entities/commit';
import Author from '../entities/author';
import Process from '../utils/process';

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
        const pathname: string[] = (new URL(url)).pathname.split('/');

        this.repository = path.basename(pathname.pop() as string, `.${Provider.TYPE}`);
        this.owner = pathname.pop() as string;

        const pattern = `.${Provider.TYPE}/HEAD`;
        const filepath = findupSync(pattern, { cwd: process.cwd() });

        if (fs.existsSync(filepath)) {
            const buffer: Buffer = fs.readFileSync(filepath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                [,this.branch] = match;
            } else {
                Process.error(chalk`{bold ${pattern}} - ref(s) SHA not found`);
            }
        } else {
            Process.error(chalk`{bold ${pattern}} - does not exist`);
        }

        Process.info('Provider', this.constructor.name);
        Process.info('Repository', this.repository);
        Process.info('Owner', this.owner);
        Process.info('Brach', this.branch);
    }

    abstract async getCommits(page: number): Promise<[Commit, Author][]>;
}
