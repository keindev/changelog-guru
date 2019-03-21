import dotenv from 'dotenv';
import Reader from './io/reader';
import Process from './utils/process';

export interface Options {
    config?: string;
    token?: string
}

export default class Changelog {
    private reader: Reader;

    public constructor(options: Options) {
        if (!options.token) dotenv.config();
        if (!process.env.GITHUB_TOKEN) Process.error('<token> option must be provided');

        this.reader = new Reader(options.token || process.env.GITHUB_TOKEN || '', options.config);
    }

    public async generate(): Promise<void> {
        await this.reader.read();

        // TODO: plugins

        // TODO: write
    }
}
