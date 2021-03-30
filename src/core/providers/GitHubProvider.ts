import Provider from 'gh-gql';
import { ICommit as IGitHubCommit } from 'gh-gql/lib/queries/Commit';
import { TaskTree } from 'tasktree-cli';
import { PackageJson } from 'type-fest';

import { GitServiceProvider } from '../Config';
import Author, { IAuthor } from '../entities/Author';
import Commit, { ICommit } from '../entities/Commit';
import GitProvider, { IGitProviderOptions } from './GitProvider';

export default class GitHubProvider extends GitProvider {
  #provider: Provider;
  #authors = new Map<number, Author>();

  constructor(url: string, branch: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitHub, url, branch });

    this.#provider = new Provider();
  }

  async getLastChangeDate(dev?: boolean): Promise<Date> {
    const lastCommit = await this.#provider.query.commit.getLastCommit({
      owner: this.owner,
      repository: this.repository,
      branch: dev ? this.branch.dev : this.branch.main,
    });

    return new Date(lastCommit?.committedDate ?? Date.now());
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

  async getPreviousPackage(since: Date): Promise<PackageJson> {
    const data = await this.getPackage(this.branch.main, since);

    return data;
  }

  async getCurrentPackage(since: Date): Promise<PackageJson> {
    const data = await this.getPackage(this.branch.dev, since);

    return data;
  }

  private async getPackage(branch: string, since: Date): Promise<PackageJson> {
    const { owner, repository, package: filePath } = this;
    const task = TaskTree.add(`Loading {bold package.json} from {bold ${branch}}...`);
    let data: PackageJson = {};

    const id = await this.#provider.query.file.getId({
      until: since.toISOString(),
      branch,
      owner,
      repository,
      filePath,
    });

    if (id) {
      const text = await this.#provider.query.file.getContent({ filePath, owner, repository, oid: id });

      if (text) {
        data = JSON.parse(text);
        task.complete(`File {bold package.json} is loaded for {bold ${branch}}`);
      }
    } else {
      task.skip(`Branch {bold ${branch}} did not contain {bold package.json}`);
    }

    return data;
  }

  private parseCommit(commit: IGitHubCommit): ICommit {
    const { url, oid: hash, messageHeadline: headline, messageBody: body } = commit;
    const timestamp = new Date(commit.committedDate).getTime();
    const author = this.parseAuthor(commit.author);

    return new Commit({ hash, headline, body, author, timestamp, url });
  }

  private parseAuthor({ avatarUrl, user: { databaseId, login, url } }: IGitHubCommit['author']): IAuthor {
    const author = this.#authors.get(databaseId) ?? new Author({ login, url, avatar: avatarUrl });

    if (!this.#authors.has(databaseId)) this.#authors.set(databaseId, author);

    return author;
  }
}
