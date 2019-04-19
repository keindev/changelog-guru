import Commit from '../../entities/commit';
import Author from '../../entities/author';

export enum ProviderName {
    None = '',
    GitHub = 'github',
    // not supported yet
    GitLab = 'gitlab',
}

export default abstract class Provider {
    public static COMMITS_PAGE_SIZE: number = 100;
    public static EXTENSION: string = '.git';

    abstract async init(repo: string, owner: string): Promise<void>;
    abstract async getCommits(page: number): Promise<Array<[Commit, Author]>>;
}
