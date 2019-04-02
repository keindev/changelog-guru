import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';
import Modifier from './modifier';

export interface Plugin {
    parse(commit: Commit): void;
    modify(state: State, commit: Commit): Promise<void>;
    modify(state: State, commit: Commit, modifier: Modifier): Promise<void>;
}

export default abstract class AbstractPlugin implements Plugin {
    protected config: Config;
    private modifier: string | undefined;

    public constructor(config: Config) {
        this.config = config;
    }

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
