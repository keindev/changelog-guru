import { TaskTree } from 'tasktree-cli';
import { ChangeLevel, ExclusionType, ServiceProvider } from './typings/enums';
import { ConfigOptions, PluginOption } from './typings/types';
import { Provider } from '../providers/provider';
import { GitHubProvider } from '../providers/github/provider';

export class Config {
    public readonly filePath: string;
    public readonly provider: ServiceProvider;

    private types: Map<string, ChangeLevel>;
    private plugins: Map<string, PluginOption>;
    private exclusions: Map<ExclusionType, string[]>;

    public constructor(options: ConfigOptions) {
        this.provider = options.provider;
        this.filePath = options.filePath;
        this.types = options.types;
        this.plugins = options.plugins;
        this.exclusions = options.exclusions;
    }

    public async getProvider(repository: string): Promise<Provider> {
        const tasks = TaskTree.tree();
        let provider: Provider | undefined;

        switch (this.provider) {
            case ServiceProvider.GitLab:
                tasks.fail(`${ServiceProvider.GitLab} - not supported yet`);
                break;
            case ServiceProvider.GitHub:
                provider = new GitHubProvider(repository);
                break;
            default:
                tasks.fail(`Service provider not specified`);
                break;
        }

        return provider as Provider;
    }

    public getPlugin(name: string): PluginOption | undefined {
        return this.plugins.get(name);
    }

    public getPlugins(): [string, PluginOption][] {
        return [...this.plugins.entries()];
    }

    public getTypes(): [string, ChangeLevel][] {
        return [...this.types.entries()];
    }

    public getExclusions(): [ExclusionType, string[]][] {
        return [...this.exclusions.entries()];
    }
}
