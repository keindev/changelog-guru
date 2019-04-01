import dotenv from 'dotenv';
import Reader from './io/reader';
import Process from './utils/process';

export interface Options {
    config?: string;
    token?: string;
}

export default class Changelog {
    private reader: Reader;

    public constructor(options: Options) {
        if (!options.token) dotenv.config();
        if (!process.env.GITHUB_TOKEN) Process.error('<token> option must be provided');

        this.reader = new Reader(options.token || process.env.GITHUB_TOKEN || '', options.config);
    }

    public async generate(): Promise<void> {
        const [state, plugins] = await this.reader.read();
        const promises: Promise<void>[] = [];

        state.modify((commit) => {
            promises.push(plugins.process(state, commit));
        });

        await Promise.all(promises);

        // TODO: plugins

        // TODO: write
    }
}
