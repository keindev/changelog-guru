import Commit from './commit';
import State from './state';
import { Options } from '../io/config';

export default abstract class Plugin {
    protected state: State;

    public constructor(state: State) {
        this.state = state;
    }

    public abstract async init(config: Options): Promise<void>;
    public abstract async parse(commit: Commit): Promise<void>;
}
