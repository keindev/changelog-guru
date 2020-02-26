import { TaskTree } from 'tasktree-cli';
import GitProvider from '../providers/GitProvider';
import Package, { Dependency, Restriction } from '../Package';
import State from '../State';
import License from '../License';

export default class Reader {
    #provider: GitProvider;

    constructor(provider: GitProvider) {
        this.#provider = provider;
    }

    async read(packageInfo: Package): Promise<State> {
        const task = TaskTree.add('Loading a release state...');
        const state = new State();
        const { date, tag } = await this.#provider.getLastRelease();
        const count = await this.#provider.getCommitsCount(date);

        task.log(`Last release date: ${date}`);
        task.log(`Last release tag: ${tag}`);

        if (count) {
            await this.loadCommits(count, state, date);
        } else {
            task.warn(`Branch don't have commits since ${date}`);
        }

        state.license = await this.loadPackage(state, packageInfo);
        task.complete(`Release information:`);

        return state;
    }

    private async loadCommits(count: number, state: State, date: Date): Promise<void> {
        const pagesCount = Math.ceil(count / this.#provider.pageSize);
        const task = TaskTree.add('Loading commits...');
        const bar = task.bar(':bar :percent :etas', { total: count });
        const promises = [];
        let pageIndex = 0;

        while (pagesCount > pageIndex) {
            promises.push(this.#provider.getCommits(date, pageIndex++).then(commits => {
                commits.forEach(commit => state.addCommit(commit));
                bar.tick(commits.length);
            }));
        }

        await Promise.all(promises);
        task.complete(`{bold ${count}} commits loaded`, true);
    }

    private async loadPackage(state: State, currPackage: Package): Promise<License> {
        const prevPackage = await this.#provider.getPrevPackage();

        Object.values(Dependency).forEach(prop => {
            prevPackage[prop] && state.setChanges(prop, currPackage.getDependenciesChanges(prop, new Map(Object.entries(prevPackage[prop]!))));
        });

        Object.values(Restriction).forEach(prop => {
            prevPackage[prop] && state.setChanges(prop, currPackage.getRestrictionsChanges(prop, prevPackage[prop]!));
        });

        return new License(currPackage.license, prevPackage.license);
    }
}
