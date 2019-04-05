import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';
import Modifier from './modifier';
import Process from '../utils/process';

const debug = Process.getDebugger('entities:plugin');

export interface Plugin {
    parse(commit: Commit): void;
    modify(state: State, commit: Commit): Promise<void>;
    modify(state: State, commit: Commit, modifier: Modifier): Promise<void>;
}

export default abstract class AbstractPlugin implements Plugin {
    protected config: Config;
    private modifier: string | undefined;

    public constructor(config: Config) {
        debug('create [Plugin]: %s', this.constructor.name);

        this.config = config;
    }

    public abstract parse(commit: Commit): void;
    public abstract modify(state: State, commit: Commit): Promise<void>;
    public abstract modify(state: State, commit: Commit, modifier: Modifier): Promise<void>;

    public addModifier(commit: Commit, modifier: Modifier): void {
        commit.modifiers.push(modifier);

        if (typeof this.modifier === 'undefined') {
            this.modifier = modifier.constructor.name;
        }
    }

    public isCompatible(modifier: Modifier): boolean {
        return this.modifier === modifier.constructor.name;
    }
}
