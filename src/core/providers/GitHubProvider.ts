import Provider from 'gh-gql';
import { ICommit as IGitHubCommit } from 'gh-gql/lib/queries/Commit';
import { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';

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

  async getLastChangeDate(): Promise<Date> {
    const lastCommit = await this.#provider.query.commit.getLastCommit({
      owner: this.owner,
      repository: this.repository,
      branch: this.branch.main,
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

  async getPrevPackage(since: Date): Promise<PackageJson> {
    const task = TaskTree.add('Loading previous release {bold package.json} state...');
    const { owner, repository, branch, package: filePath } = this;
    let data: PackageJson = {};

    const id = await this.#provider.query.file.getId({
      branch: branch.main,
      until: since.toISOString(),
      owner,
      repository,
      filePath,
    });

    if (id) {
      const text = await this.#provider.query.file.getContent({ filePath, owner, repository, oid: id });

      if (text) {
        data = JSON.parse(text);

        task.complete('Previous release {bold package.json} state loaded');
      }
    } else {
      task.skip('The previous release did not contain package.json');
    }

    return data;
  }

  private parseCommit({ author, committedDate, ...commit }: IGitHubCommit): ICommit {
    return new Commit({ ...commit, author: this.parseAuthor(author), timestamp: new Date(committedDate).getTime() });
  }

  private parseAuthor({ avatarUrl, user: { databaseId, login, url } }: IGitHubCommit['author']): IAuthor {
    const author = this.#authors.get(databaseId) ?? new Author(login, url, avatarUrl);

    if (!this.#authors.has(databaseId)) this.#authors.set(databaseId, author);

    return author;
  }
}
