import { Config } from "../io/reader";

export default class Plugin {
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public async parse(): Promise<boolean> {

    }

    public async modify(): Promise<boolean> {

    }

    public async validate(): Promise<boolean> {
        return true;
    }
}
