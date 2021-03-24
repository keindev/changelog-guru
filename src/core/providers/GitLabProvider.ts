import { PackageJson } from 'read-pkg';

import { GitServiceProvider } from '../Config';
import { ICommit } from '../entities/Commit';
import GitProvider, { IGitProviderOptions } from './GitProvider';

export default class GitLabProvider extends GitProvider {
  constructor(url: string, branch: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitLab, url, branch });
  }

  async getLastChangeDate(): Promise<Date> {
    return new Date();
  }

  async getCommits(_since: Date): Promise<ICommit[]> {
    return [];
  }

  async getPrevPackage(_since: Date): Promise<PackageJson> {
    return {};
  }
}
