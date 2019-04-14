import dotenv from 'dotenv';
import Reader from './io/reader';
import Process from './utils/process';
import Entity from './entities/entity';

export interface Options {
    config?: string;
}

export default class Changelog extends Entity {
    private reader: Reader;

    public constructor(options: Options) {
        super();

        dotenv.config();

        if (!process.env.GITHUB_TOKEN) Process.error('<token> option must be provided');

        this.reader = new Reader(process.env.GITHUB_TOKEN || '', options.config);
    }

    public async generate(): Promise<void> {
        const [state, plugins] = await this.reader.read();

        await state.commits.forEach((commit): Promise<void> => plugins.parse(commit));
    }
}
