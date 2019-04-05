import Commit from './commit';
import Process from '../utils/process';

const debug = Process.getDebugger('entities:plugin');

export default class Section {
    private name: string;
    private commits: Map<string, Commit> = new Map();

    public constructor(name: string) {
        debug('create [Section]: %s', name);

        this.name = name;
    }

    public assign(commit: Commit): void {
        if (commit.isValid() && commit.isVisible()) {
            debug('assign [Section]: %s, with [Commit]: %s', this.name, commit.sha);

            this.commits.set(commit.sha, commit);
        }
    }
}
