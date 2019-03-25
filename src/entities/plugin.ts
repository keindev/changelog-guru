import { Config } from '../io/reader';
import Commit from './commit';
import State from '../middleware/state';

export default interface Plugin {
    parse(state: State, commit: Commit): void;
    modify(): Promise<void>;
}

export default abstract class AbstractPlugin implements Plugin {
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }
}
