import { Package } from 'package-json-helper';

import { GitServiceProvider } from '../Config.js';
import { ICommit } from '../entities/Commit.js';
import GitProvider, { IGitProviderOptions } from './GitProvider.js';

export default class GitLabProvider extends GitProvider {
  constructor(url: string, branch?: IGitProviderOptions['branch']) {
    super({ type: GitServiceProvider.GitLab, url, branch });
  }

  getCommits(_: Date): Promise<ICommit[]> {
    throw new Error();
  }

  getCurrentPackage(_: Date): Promise<Package> {
    throw new Error();
  }

  getLastChangeDate(_?: boolean): Promise<Date> {
    throw new Error();
  }

  getPreviousPackage(_: Date): Promise<Package> {
    throw new Error();
  }
}
