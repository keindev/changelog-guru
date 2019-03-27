import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';

export default class Scope extends AbstractPlugin {
    public parse(state: State, commit: Commit): void {

    }

    public async modify(): Promise<void> {

    }
}
