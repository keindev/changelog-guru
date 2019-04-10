import dotenv from 'dotenv';
import Reader from './io/reader';
import Process from './utils/process';
import Entity from './entities/entity';

export interface Options {
    config?: string;
    token?: string;
}

export default class Changelog extends Entity {
    private reader: Reader;

    public constructor(options: Options) {
        super();

        if (!options.token) dotenv.config();
        if (!process.env.GITHUB_TOKEN) Process.error('<token> option must be provided');

        this.reader = new Reader(options.token || process.env.GITHUB_TOKEN || '', options.config);
    }

    public async generate(): Promise<void> {
        const [state, plugins] = await this.reader.read();

        state.commits.modify((commit): Promise<void> => plugins.process(commit));
        this.debug('test %O', state.sections);

        // TODO: write
    }
}
