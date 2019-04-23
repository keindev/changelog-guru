import dotenv from 'dotenv';
import Reader from './io/reader';
import Provider, { ProviderName } from './providers/provider';
import GitHubProvider from './providers/github-provider';
import GitLabProvider from './providers/gitlab-provider';
import Config, { ConfigOptions } from './entities/config';
import Package from './entities/package';
import * as Process from './utils/process';

dotenv.config();

export default class Changelog {
    private config: Config;
    private package: Package;

    public constructor(options?: ConfigOptions) {
        Process.Instance.addTask('Reading configuration files');

        this.config = new Config(options);
        this.package = new Package();

        Process.Instance.completeTask();
    }

    public async generate(): Promise<void> {
        const { config, package: { url } } = this;
        let provider: Provider | undefined;

        switch(config.provider) {
        case ProviderName.GitHub: provider = new GitHubProvider(url); break;
        case ProviderName.GitLab: provider = new GitLabProvider(url); break;
        default: Process.Instance.failTask(`Provider is not specified (${config.provider})`); break;
        }

        if (provider) {
            const reader = new Reader(provider);
            const state = await reader.read();

            // await state.modify(config.plugins, config.options);
        }
    }
}
