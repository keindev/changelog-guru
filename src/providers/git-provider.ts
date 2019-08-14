import fs from 'fs';
import path from 'path';
import getUserAgent from 'universal-user-agent';
import findupSync from 'findup-sync';
import { TaskTree } from 'tasktree-cli';
import { Provider } from './provider';
import { ServiceProvider } from '../config/config';

export abstract class GitProvider extends Provider {
    public static DEFAULT_BRANCH = 'master';
    public static TYPE = 'git';

    protected repository: string;
    protected owner: string;
    protected branch: string = GitProvider.DEFAULT_BRANCH;
    protected version = process.env.npm_package_version;
    protected userAgent: string;

    public constructor(type: ServiceProvider, url: string, branch?: string) {
        super(type);

        const task = TaskTree.add('Initializing git provider');
        const pathname = new URL(url).pathname.split('/');
        const pattern = `.${GitProvider.TYPE}/HEAD`;

        this.repository = path.basename(pathname.pop() as string, `.${GitProvider.TYPE}`);
        this.owner = pathname.pop() as string;
        this.userAgent = `changelog-guru/${this.version} ${getUserAgent()}`;

        if (branch) {
            this.branch = branch;
        } else {
            const filePath = findupSync(pattern, { cwd: process.cwd() });

            if (filePath && fs.existsSync(filePath)) {
                const buffer = fs.readFileSync(filePath);
                const match = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

                if (match) {
                    [, this.branch] = match;
                } else {
                    task.warn(`{bold ${pattern}} - ref(s) SHA not found`);
                }
            } else {
                task.warn(`{bold ${pattern}} - does not exist`);
            }
        }

        task.log(`Provider: {bold ${this.type}}`);
        task.log(`Repository: {bold ${this.repository}}`);
        task.log(`Branch: {bold ${this.branch}}`);
        task.log(`Owner: {bold ${this.owner}}`);
        task.complete('Git provider:');
    }
}
