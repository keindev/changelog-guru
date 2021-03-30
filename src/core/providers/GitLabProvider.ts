import { PackageJson } from 'type-fest';

import { GitServiceProvider } from '../Config';
import { ICommit } from '../entities/Commit';
import GitProvider, { IGitProviderOptions } from './GitProvider';

export default class GitLabProvider extends GitProvider {
  constructor(url: string, branch: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitLab, url, branch });
  }

  async getLastChangeDate(_?: boolean): Promise<Date> {
    return new Date();
  }

  async getCommits(_: Date): Promise<ICommit[]> {
    return [];
  }

  async getPreviousPackage(_: Date): Promise<PackageJson> {
    return {};
  }

  async getCurrentPackage(_: Date): Promise<PackageJson> {
    return {};
  }
}
