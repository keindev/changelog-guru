import { TaskTree } from 'tasktree-cli';
import Provider from '../providers/Provider';
import Package, { DependencyRuleType, RestrictionRuleType } from '../package/Package';
import DependencyRule from '../package/properties/DependencyRule';
import RestrictionRule from '../package/properties/RestrictionRule';
import State from '../State';

export default class Reader {
    #provider: Provider;

    constructor(provider: Provider) {
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

        await this.loadPackage(state, packageInfo);
        task.complete(`Release information:`);

        return state;
    }

    private async loadCommits(count: number, state: State, date: Date): Promise<void> {
        const pagesCount = Math.ceil(count / Provider.PAGE_SIZE);
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

    private async loadPackage(state: State, packageInfo: Package): Promise<void> {
        const prev = await this.#provider.getPrevPackage();



        state.setLicense(packageInfo.license, prev.license);

        Object.values(DependencyRuleType).forEach(type => {
            state.setPackageRule(new DependencyRule(type, packageInfo.getDependencies(type), prev[type]));
        });

        Object.values(RestrictionRuleType).forEach(type => {
            state.setPackageRule(new RestrictionRule(type, ...packageInfo.getRestrictionsStory(type, prev)));
        });
    }
}
