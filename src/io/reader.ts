import { TaskTree } from 'tasktree-cli';
import { Provider } from '../providers/provider';
import { State } from '../state/state';
import { Package } from '../package/package';
import { DependencyRuleType, RestrictionRuleType } from '../package/rules/typings/enums';
import { DependencyRule } from '../package/rules/dependency-rule';
import { RestrictionRule } from '../package/rules/restriction-rule';

export class Reader {
    private provider: Provider;

    public constructor(provider: Provider) {
        this.provider = provider;
    }

    public async read(packageInfo: Package): Promise<State> {
        const { provider } = this;
        const task = TaskTree.tree().add('Loading a release state...');
        const state = new State();
        const { date, tag } = await provider.getLastRelease();

        task.log(`Last release date: ${date}`);
        task.log(`Last release tag: ${tag}`);
        await this.loadCommits(state);
        await this.loadPackage(state, packageInfo);
        task.complete(`Release information:`);

        return state;
    }

    private async loadCommits(state: State, pageIndex: number = 0): Promise<void> {
        const commits = await this.provider.getCommits(pageIndex);
        const { length } = commits;

        if (length) {
            commits.forEach((commit): void => state.addCommit(commit));

            if (length === Provider.PAGE_SIZE) {
                await this.loadCommits(state, pageIndex + 1);
            }
        }
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
