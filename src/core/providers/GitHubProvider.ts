import Provider from 'gh-gql';
import Package from 'package-json-helper';
import TaskTree from 'tasktree-cli';

import { GitServiceProvider } from '../Config.js';
import Author, { IAuthor } from '../entities/Author.js';
import Commit, { ICommit } from '../entities/Commit.js';
import GitProvider, { IGitProviderOptions } from './GitProvider.js';

export default class GitHubProvider extends GitProvider {
  #authors = new Map<string, Author>();
  #provider: Provider;

  constructor(url: string, branch?: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitHub, url, branch });

    this.#provider = new Provider();
  }

  async getCommits(since: Date): Promise<ICommit[]> {
    const commits: ICommit[] = [];
    const list = await this.#provider.query.commit.getList({
      owner: this.owner,
      repository: this.repository,
      branch: this.branch.dev,
      since: since.toISOString(),
    });

    commits.push(...list.map(commit => this.parseCommit(commit)));

    return commits;
  }

  async getCurrentPackage(since: Date): Promise<Package> {
    const pkg = await this.getPackage(this.branch.dev, since);

    return pkg;
  }

  async getLastChangeDate(dev?: boolean): Promise<Date> {
    const lastCommit = await this.#provider.query.commit.getLastCommit({
      owner: this.owner,
      repository: this.repository,
      branch: dev ? this.branch.dev : this.branch.main,
    });

    return new Date(lastCommit?.committedDate ?? Date.now());
  }

  async getPreviousPackage(since: Date): Promise<Package> {
    const pkg = await this.getPackage(this.branch.main, since);

    return pkg;
  }

  private async getPackage(branch: string, since: Date): Promise<Package> {
    const { owner, repository, package: filePath } = this;
    const task = TaskTree.add(`Loading {bold package.json} from {bold ${branch}}...`);
    const id = await this.#provider.query.file.getId({
      until: since.toISOString(),
      branch,
      owner,
      repository,
      filePath,
    });
    let data = {};

    if (id) {
      const text = await this.#provider.query.file.getContent({ filePath, owner, repository, oid: id });

      if (text) {
        data = JSON.parse(text);
        task.complete(`File {bold package.json} is loaded for {bold ${branch}}`);
      }
    } else {
      task.skip(`Branch {bold ${branch}} did not contain {bold package.json}`);
    }

    return new Package(data);
  }

  private parseAuthor({
    avatarUrl,
    user: { login, url },
  }: {
    avatarUrl: string;
    user: { login: string; url: string };
  }): IAuthor {
    const author = this.#authors.get(login) ?? new Author({ login, url, avatar: avatarUrl });

    if (!this.#authors.has(login)) this.#authors.set(login, author);

    return author;
  }

  private parseCommit(commit: {
    author: {
      avatarUrl: string;
      user: {
        login: string;
        url: string;
      };
    };
    committedDate: string;
    messageBody: string;
    messageHeadline: string;
    oid: string;
    url: string;
  }): ICommit {
    const { url, oid: hash, messageHeadline: headline, messageBody: body } = commit;
    const timestamp = new Date(commit.committedDate).getTime();
    const author = this.parseAuthor(commit.author);

    return new Commit({ hash, headline, body, author, timestamp, url });
  }
}
