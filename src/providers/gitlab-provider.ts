import Provider from './provider';
import Author from '../entities/author';
import Commit from '../entities/commit';
import Process from '../utils/process';

export default class GitLabProvider extends Provider {
    public async getCommits(page: number): Promise<[Commit, Author][]> {
        Process.error(`${this.constructor.name} is not avaliable yet, page #${page} not load`);

        return [];
    }
}
