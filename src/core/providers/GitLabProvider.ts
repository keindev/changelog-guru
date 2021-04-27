import { PackageJson } from 'type-fest';

import { GitServiceProvider } from '../Config';
import { ICommit } from '../entities/Commit';
import GitProvider, { IGitProviderOptions } from './GitProvider';

export default class GitLabProvider extends GitProvider {
  constructor(url: string, branch?: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitLab, url, branch });
  }

  getLastChangeDate(_?: boolean): Promise<Date> {
    return Promise.resolve(new Date());
  }

  getCommits(_: Date): Promise<ICommit[]> {
    return Promise.resolve([]);
  }

  getPreviousPackage(_: Date): Promise<PackageJson> {
    return Promise.resolve({});
  }

  getCurrentPackage(_: Date): Promise<PackageJson> {
    return Promise.resolve({});
  }
}
