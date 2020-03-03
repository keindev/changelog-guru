import path from 'path';
import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import { IPluginConfig } from '../plugins/Plugin';
import { ChangeLevel } from './entities/Entity';

// TODO: MOVE to Changelog.ts and remove class
export interface IConfig {
    provider?: ServiceProvider;
    changes?: { [key in ChangeLevel]: string[] };
    output?: { filePath?: string; exclude?: { [key in ExclusionType]: string[] } };
    plugins?: { [key: string]: IPluginConfig };
}

export default class Config {
    private provider?: ServiceProvider;
    private filePath?: string;
    private types = new Map<string, ChangeLevel>;
    private plugins = new Map<string, IPluginConfig>();
    private exclusions = new Map<ExclusionType, string[]>();

    constructor({ output, provider }: { provider?: ServiceProvider; output?: string }) {
        this.filePath = output;
        this.provider = provider;
    }

    async load(): Promise<void> {
        const task = TaskTree.add('Reading configuration file...');
        const explorer = cosmiconfig('changelog');
        const conf = await explorer.load(path.join(__dirname, `../../../.changelogrc.default.yml`));

        if (conf?.isEmpty !== false) task.fail('Default configuration file not found');

        const userConf = await explorer.search();
        const { provider, output, changes, plugins }: IConfig =
            userConf?.isEmpty === false ? deepmerge(conf!.config, userConf.config) : conf!.config;

        this.provider = this.provider ?? provider ?? ServiceProvider.GitHub;
        this.filePath = this.filePath ?? output?.filePath ?? 'CHANGELOG.md';
        this.types = parseTypes(changes);
        this.exclusions = parseExclusions(output);
        this.plugins = parsePlugins(plugins);
        task.complete(`Config file: {bold ${path.relative(process.cwd(), (conf?.filepath || userConf?.filepath)!)}}`);
    }


}
