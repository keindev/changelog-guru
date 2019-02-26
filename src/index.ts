import dotenv from 'dotenv';
import Reader from './io/reader';
import Process from './utils/process';

export interface Options {
    configPath: string;
    token?: string
}

export default class Changelog {
    private reader: Reader;

    public constructor(options: Options) {
        if (!options.token) dotenv.config();
        if (!process.env.CHANGELOG_GITHUB_TOKEN) Process.error('<token> option must be provided');

        this.reader = new Reader(options.token || process.env.CHANGELOG_GITHUB_TOKEN || '');
        this.reader.readConfig(options.configPath);
    }

    public async generate(): Promise<void> {

        await this.reader.readPackage();
        await this.reader.readCommits();

        // TODO: plugins

        // TODO: write
    }
}
