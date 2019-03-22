import { Config } from "../io/reader";

export default class Plugin {
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public async parse(): Promise<void> {
    }

    public async modify(): Promise<boolean> {
        return true;
    }

    public async validate(): Promise<boolean> {
        return true;
    }
}
