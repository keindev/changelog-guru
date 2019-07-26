import { TaskTree } from 'tasktree-cli';
import { Provider } from '../providers/provider';
import { State } from '../entities/state';
import { Package } from '../entities/package/package';
import { DependencyType, Dependency } from '../entities/package/dependency';

const $tasks = TaskTree.tree();

export class Reader {
    private provider: Provider;

    public constructor(provider: Provider) {
        this.provider = provider;
    }

    public async read(pkg: Package): Promise<State> {
        const { provider } = this;
        const task = $tasks.add('Loading a release state...');
        const state = new State();
        const { date, tag } = await provider.getLastRelease();

        task.log(`Last release date: ${date}`);
        task.log(`Last release tag: ${tag}`);
        await this.loadCommits(state);
        await this.loadPackage(state, pkg);
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

    private async loadPackage(state: State, pkg: Package): Promise<void> {
        const data = await this.provider.getPrevPackage();

        state.setLicense(pkg.getLicense(), data.license);

        Object.values(DependencyType).forEach((type): void => {
            state.setDependencies(new Dependency(type, ...pkg.getDependenciesStories(type, data)));
        });

        /*
            TODO: add this ->
            // https://docs.npmjs.com/files/package.json#bundleddependencies
            https://docs.npmjs.com/files/package.json#os
            https://docs.npmjs.com/files/package.json#cpu
        */
    }
}
