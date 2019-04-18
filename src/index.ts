import dotenv from 'dotenv';
import Reader from './io/reader';
import Config, { Options } from './io/config';
import Process from './utils/process';

dotenv.config();

export default class Changelog {
    private reader: Reader;
    private config: Config;

    // TODO: configuration interface
    public constructor(options?: Options) {
        this.config = new Config(options);
        this.reader = new Reader(this.config.provider);
    }

    public async generate(): Promise<void> {
        const state = await this.reader.read();
        const { config } = this;

        await state.modify(config.plugins, config.options);
    }
}
