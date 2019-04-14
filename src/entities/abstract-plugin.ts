import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';
import Entity from './entity';
import Key from '../utils/key';
import { SectionPosition } from './section';

export interface Plugin {
    parse(commit: Commit): void;
}

export default abstract class AbstractPlugin extends Entity implements Plugin {
    protected config: Config;
    protected state: State;
    protected sections: Map<string, number> = new Map();

    public constructor(config: Config, state: State) {
        super();

        this.config = config;
        this.state = state;
    }

    public abstract async parse(commit: Commit): Promise<void>;

    public createSection(name: string, position: SectionPosition, title?: string): void {
        const { sections } = this;
        const key: string = Key.unify(name);

        if (key.length && !sections.has(key)) {
            sections.set(key, this.state.sections.create(title || name, position));
        }
    }

    public assignSection(name: string, commit: Commit): void {
        const key: string = Key.unify(name);

        if (key.length) {
            const index: number | undefined = this.sections.get(key);

            if (typeof index === 'number') {
                this.state.sections.assign(index, commit.sha);
            }
        }
    }
}
