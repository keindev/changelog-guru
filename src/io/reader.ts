import { TaskTree } from 'tasktree-cli';
import { Progress } from 'tasktree-cli/lib/progress';
import { Provider } from '../providers/provider';
import { State } from '../state/state';
import { Package } from '../package/package';
import { DependencyRule, DependencyRuleType } from '../package/rules/dependency-rule';
import { RestrictionRule, RestrictionRuleType } from '../package/rules/restriction-rule';

export class Reader {
    private provider: Provider;

    public constructor(provider: Provider) {
        this.provider = provider;
    }

    public async read(packageInfo: Package): Promise<State> {
        const { provider } = this;
        const task = TaskTree.add('Loading a release state...');
        const state = new State();
        const { date, tag } = await provider.getLastRelease();
        const commitsCount = await provider.getCommitsCount(date);

        task.log(`Last release date: ${date}`);
        task.log(`Last release tag: ${tag}`);

        if (commitsCount) {
            await this.loadCommits(commitsCount, state, date);
        } else {
            task.warn(`Branch don't have commits since ${date}`);
        }

        await this.loadPackage(state, packageInfo);
        task.complete(`Release information:`);

        return state;
    }

    private async loadCommits(count: number, state: State, date: string): Promise<void> {
        const pagesCount = Math.ceil(count / Provider.PAGE_SIZE);
        const task = TaskTree.add('Loading commits...');
        const bar = task.bar(':bar :percent :etas', { total: pagesCount });
        const promises = [];
        let pageIndex = 0;

        while (pagesCount > pageIndex) {
            promises.push(this.loadCommitsPage(pageIndex++, state, date, bar));
        }

        await Promise.all(promises);
        task.complete(`{bold ${count}} commits loaded`, true);
    }

    private async loadCommitsPage(index: number, state: State, date: string, bar: Progress): Promise<void> {
        const commits = await this.provider.getCommits(date, index);

        commits.forEach((commit): void => state.addCommit(commit));
        bar.tick(commits.length);
    }

    private async loadPackage(state: State, packageInfo: Package): Promise<void> {
        const data = await this.provider.getPrevPackage();

        state.setLicense(packageInfo.getLicense(), data.license);

        Object.values(DependencyRuleType).forEach((type): void => {
            state.setPackageRule(new DependencyRule(type, ...packageInfo.getDependenciesStory(type, data)));
        });

        Object.values(RestrictionRuleType).forEach((type): void => {
            state.setPackageRule(new RestrictionRule(type, ...packageInfo.getRestrictionsStory(type, data)));
        });
    }
}
