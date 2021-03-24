import findupSync from 'findup-sync';
import fs from 'fs';
import path from 'path';
import { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import { getUserAgent } from 'universal-user-agent';

import { GitServiceProvider } from '../Config';
import { ICommit } from '../entities/Commit';

export enum Branch {
  Main = 'main',
  Dev = 'dev',
}

export interface IGitProvider {
  readonly type: GitServiceProvider;
  readonly package: string;

  getLastChangeDate(): Promise<Date>;
  getCommits(since: Date): Promise<ICommit[]>;
  getPrevPackage(since: Date): Promise<PackageJson>;
}

export interface IGitBranch {
  [Branch.Main]: string;
  [Branch.Dev]: string;
}

export interface IGitProviderOptions {
  type: GitServiceProvider;
  url: string;
  branch?: string;
}

export default abstract class GitProvider implements IGitProvider {
  readonly type: GitServiceProvider;
  readonly package = 'package.json';

  protected repository: string;
  protected owner: string;
  protected branch: IGitBranch;
  protected version = process.env.npm_package_version;
  protected userAgent: string;

  constructor({ type, url, branch }: IGitProviderOptions) {
    const task = TaskTree.add('Initializing git provider');
    const pathname = new URL(url).pathname.split('/');
    const filePath = findupSync('.git/HEAD', { cwd: process.cwd() });

    this.type = type;
    this.repository = path.basename(pathname.pop() as string, '.git');
    this.owner = pathname.pop() as string;
    this.userAgent = `changelog-guru/${this.version} ${getUserAgent()}`;
    this.branch = { main: branch ?? 'master', dev: '' };

    if (filePath && fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const match = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

      if (match && match[1]) {
        [, this.branch.dev] = match;
      } else {
        task.warn('{bold .git/HEAD} - ref(s) SHA not found');
      }
    } else {
      task.warn('{bold .git/HEAD} - does not exist');
    }

    task.log(`Provider: {bold ${this.type}}`);
    task.log(`Repository: {bold ${this.repository}}`);
    task.log(`Branches: from {bold ${this.branch.dev}} to {bold ${this.branch.main}}`);
    task.log(`Owner: {bold ${this.owner}}`);
    task.complete('Git provider:');
  }

  abstract getLastChangeDate(): Promise<Date>;
  abstract getCommits(since: Date): Promise<ICommit[]>;
  abstract getPrevPackage(since: Date): Promise<PackageJson>;
}
