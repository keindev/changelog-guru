const STATE_DEFAULT_NAME = '<name>';
const STATE_DEFAULT_VERSION = '1.0.0';

class State {
    constructor() {
        this.name = STATE_DEFAULT_NAME;
        this.version = STATE_DEFAULT_VERSION;
        this.commits = [];
    }

    addCommit(commit) {

    }
}

module.exports = State;
