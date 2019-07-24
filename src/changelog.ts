import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import { Reader } from './io/reader';
import { Writer } from './io/writer';
import { Provider, ServiceProvider } from './providers/provider';
import { GitHubProvider } from './providers/github/provider';
import { Configuration } from './entities/configuration';
import { Package } from './entities/package';
import { FilterType } from './utils/enums';

const $tasks = TaskTree.tree();

export default class Changelog {
    private config: Configuration;
    private pkg: Package;

    public constructor() {
        dotenv.config();

        this.config = new Configuration();
        this.pkg = new Package();
    }

    public async generate(bump: boolean = false): Promise<void> {
        const provider = await this.getProvider();

        if (provider) {
            const { config, pkg } = this;
            const reader = new Reader(provider);
            const writer = new Writer();
            const state = await reader.read(pkg);

            state.setLevels(config.getLevels());
            state.ignoreAuthors(config.getFilters(FilterType.AuthorLogin));
            state.ignoreCommits(
                config.getFilters(FilterType.CommitType),
                config.getFilters(FilterType.CommitScope),
                config.getFilters(FilterType.CommitSubject)
            );

            await state.modify(config.getPlugins(), config.getOptions());
            await writer.write(state.getAuthors(), state.getSections());

            if (bump) {
                await pkg.incrementVersion(...state.getChangesLevels());
            }
        }
    }

    private async getProvider(): Promise<Provider | undefined> {
        const { config } = this;
        const task = $tasks.add('Read configuration');
        let provider: Provider | undefined;

        await config.load(task);

        switch (config.getProvider()) {
            case ServiceProvider.GitLab:
                task.fail(`${ServiceProvider.GitLab} - not supported yet`);
                break;
            case ServiceProvider.GitHub:
                provider = new GitHubProvider(this.pkg.getRepository());
                break;
            default:
                task.fail(`Service provider not specified`);
                break;
        }

        task.complete('Configuration initialized with:');

        return provider;
    }
}
