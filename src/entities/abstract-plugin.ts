import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';
import Entity from './entity';

export interface Plugin {
    parse(commit: Commit): void;
    modify(commit: Commit): Promise<void>;
    modify(commit: Commit, modifier: Entity): Promise<void>;
}

export default abstract class AbstractPlugin extends Entity implements Plugin {
    protected config: Config;
    protected state: State;
    private modifier: string | undefined;

    public constructor(config: Config, state: State) {
        super();

        this.config = config;
        this.state = state;
    }

    public abstract parse(commit: Commit): void;
    public abstract modify(commit: Commit): Promise<void>;
    public abstract modify(commit: Commit, modifier: Entity): Promise<void>;

    public addModifier(commit: Commit, modifier: Entity): void {
        commit.modifiers.push(modifier);

        if (typeof this.modifier === 'undefined') {
            this.modifier = modifier.constructor.name;
        }
    }

    public isCompatible(modifier: Entity): boolean {
        return this.modifier === modifier.constructor.name;
    }
}
