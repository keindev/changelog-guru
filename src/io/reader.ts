import { TaskTree } from 'tasktree-cli';
import { Provider } from '../providers/provider';
import { State } from '../state/state';
import { DependencyType } from '../package/typings/enums';
import { Dependency } from '../package/dependency';
import { Package } from '../package/package';

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
            commits.forEach((entities): void => state.addCommit(...entities));

            if (length === Provider.PAGE_SIZE) {
                await this.loadCommits(state, pageIndex + 1);
            }
        }
    }

    private async loadPackage(state: State, packageInfo: Package): Promise<void> {
        const data = await this.provider.getPrevPackage();

        state.setLicense(packageInfo.getLicense(), data.license);

        Object.values(DependencyType).forEach((type): void => {
            state.setDependencies(new Dependency(type, ...packageInfo.getDependenciesStories(type, data)));
        });

        /*
            TODO: add this ->
            // https://docs.npmjs.com/files/package.json#bundleddependencies
            https://docs.npmjs.com/files/package.json#os
            https://docs.npmjs.com/files/package.json#cpu
        */
    }
}
