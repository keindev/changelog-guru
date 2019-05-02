import dotenv from 'dotenv';
import Reader from './io/reader';
import Provider, { ProviderName } from './providers/provider';
import GitHubProvider from './providers/github-provider';
import Config, { ConfigOptions } from './entities/config';
import Package from './entities/package';
import Process from './utils/process';

dotenv.config();

const $process = Process.getInstance();

export default class Changelog {
    private config: Config;
    private package: Package;
    private reader: Reader | undefined;

    public constructor(options?: ConfigOptions) {
        const task = $process.task('Reading configuration files');

        this.config = new Config(options);
        this.package = new Package();
        this.reader = this.getReader();

        if (!this.reader) task.fail(`Provider or Reader is not specified (${this.config.provider})`);

        task.complete();
    }

    public async generate(): Promise<void> {
        const { config, reader } = this;

        if (reader) {
            const state = await reader.read();

            await state.modify(config.plugins, config.options);
        }
    }

    private getReader(): Reader | undefined {
        const { config } = this;
        let provider: Provider | undefined;
        let reader: Reader | undefined;

        if (config.provider === ProviderName.GitHub) provider = new GitHubProvider(this.package.url);
        if (provider) reader = new Reader(provider);

        return reader;
    }
}