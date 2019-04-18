import Key from '../utils/key';
import Commit from './commit';
import State from '../middleware/state';
import { SectionPosition } from './section';

export default class Context {
    private sections: Map<string, number> = new Map();
    private state: State;

    public constructor(state: State) {
        this.state = state;
    }

    public add(name: string, position: SectionPosition, title?: string): void {
        const { sections } = this;
        const key: string = Key.unify(name);

        if (key.length && !sections.has(key)) {
            sections.set(key, this.state.create(title || name, position));
        }
    }

    public assign(name: string, commit: Commit): void {
        const { sections } = this;
        const key: string = Key.unify(name);

        if (key.length && sections.has(key)) {
            this.state.assign(sections.get(key) as number, commit.sha);
        }
    }
}
