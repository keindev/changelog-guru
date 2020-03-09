import { Task } from 'tasktree-cli/lib/task';
import Commit from '../../core/entities/Commit';
import { unify, findSame } from '../../utils/Text';
import Plugin, { IPluginLintOptions, IPluginConfig } from '../Plugin';

export default class ScopeLinker extends Plugin {
    #onlyPresented = false;
    #names = new Map<string, string>();

    constructor(config: IPluginConfig, context?: IPluginContext) {
        const { onlyPresented, names } = config as {
            onlyPresented: boolean;
            names: { [key: string]: string };
        };

        this.#onlyPresented = onlyPresented;
        this.#names = new Map(Object.entries(names).map(([abbr, name]) => [unify(abbr), name]));
    }

    async parse(commit: Commit): Promise<void> {
        if (commit.scope) {
            commit.scope.split(',').forEach(name => {
                const actualName = findSame(name, [...this.#names.keys()]);

                if (actualName) {
                    const accent = this.#names.get(actualName);

                    if (accent || (!this.#onlyPresented && name.length)) commit.addAccent((accent || name).trim());
                }
            });
        }
    }

    lint({ scope }: IPluginLintOptions, task: Task): void {
        const names = [...this.#names.keys()];

        scope.split(',').forEach(name => {
            if (name.length < 2) task.error(`Scope name {bold ${name}} is too short`);
            if (this.#onlyPresented && !findSame(name, names)) task.error(`Scope {bold ${name}} is not available`);
        });
    }
}
