import { Task } from 'tasktree-cli/lib/task';
import Plugin from '../../src/entities/plugin';
import { ConfigOptions } from '../../src/entities/config';
import Commit from '../../src/entities/commit';
import { Context } from '../../src/entities/state';
import Section, { Position } from '../../src/entities/section';

const context: Context = {
    findSection(title: string): Section | undefined {
        return new Section(title, Position.Header);
    },
    addSection(title: string, position: Position): Section {
        return new Section(title, position);
    },
};

class TestPlugin extends Plugin {
    public getContext(): Context {
        return this.context;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async init(config: ConfigOptions): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async parse(commit: Commit, task: Task): Promise<void> {
        return Promise.resolve();
    }
}

describe('Plugin', (): void => {
    it('Create', (): void => {
        const plugin = new TestPlugin(context);

        expect(plugin.getContext()).toStrictEqual(context);
    });
});
