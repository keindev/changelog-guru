import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';

export default interface Plugin {
    parse(commit: Commit): void;
    modify(state: State, commit: Commit): Promise<void>;
}

export default abstract class AbstractPlugin implements Plugin {
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }
}
