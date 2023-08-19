import findupSync from 'findup-sync';
import fs from 'fs';
import { Package } from 'package-json-helper';
import path from 'path';
import TaskTree from 'tasktree-cli';
import { getUserAgent } from 'universal-user-agent';

import { GitServiceProvider } from '../Config.js';
import { ICommit } from '../entities/Commit.js';

export enum Branch {
  Main = 'main',
  Dev = 'dev',
}

export interface IGitProvider {
  readonly branch: IGitBranch;
  readonly package: string;
  readonly type: GitServiceProvider;

  getCommits(since: Date): Promise<ICommit[]>;
  getCurrentPackage(since: Date): Promise<Package>;
  getLastChangeDate(dev?: boolean): Promise<Date>;
  getPreviousPackage(since: Date): Promise<Package>;
}

export interface IGitBranch {
  [Branch.Dev]: string;
  [Branch.Main]: string;
}

export interface IGitProviderOptions {
  branch?: string;
  type: GitServiceProvider;
  url: string;
}

export default abstract class GitProvider implements IGitProvider {
  readonly branch: IGitBranch;
  readonly package = 'package.json';
  readonly type: GitServiceProvider;

  protected owner: string;
  protected repository: string;
  protected userAgent: string;
  protected version = process.env.npm_package_version;

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

  abstract getCommits(since: Date): Promise<ICommit[]>;
  abstract getCurrentPackage(since: Date): Promise<Package>;
  abstract getLastChangeDate(dev?: boolean): Promise<Date>;
  abstract getPreviousPackage(since: Date): Promise<Package>;
}
