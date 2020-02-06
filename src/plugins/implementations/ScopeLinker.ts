import { Task } from 'tasktree-cli/lib/task';
import Commit from '../../core/entities/Commit';
import Key from '../../utils/Key';
import Plugin, { IPluginLintOptions, IPluginConfig } from '../Plugin';

export default class ScopeLinker extends Plugin {
    public static DELIMITER = ',';
    public static MIN_NAME_LENGTH = 2;

    private onlyPresented = false;
    private names = new Map<string, string>();

    async init(config: IPluginConfig): Promise<void> {
        const { onlyPresented, names } = config as {
            onlyPresented: boolean;
            names: { [key: string]: string };
        };

        this.onlyPresented = onlyPresented;
        this.names = new Map(Object.entries(names).map(([abbr, name]) => [Key.unify(abbr), name]));
    }

    async parse(commit: Commit): Promise<void> {
        const scope = commit.getScope();

        if (scope) {
            scope.split(ScopeLinker.DELIMITER).forEach(name => {
                const accent = Key.inMap(name, this.names);

                if (accent || (!this.onlyPresented && name.length)) commit.addAccent((accent || name).trim());
            });
        }
    }

    lint(options: IPluginLintOptions, task: Task): void {
        const { scope } = options;

        if (scope) {
            const { onlyPresented, names } = this;

            scope.split(ScopeLinker.DELIMITER).forEach(name => {
                if (name.length < ScopeLinker.MIN_NAME_LENGTH) task.error(`Scope name {bold ${name}} is too short`);
                if (onlyPresented && !Key.inMap(name, names)) task.error(`Scope {bold ${name}} is not available`);
            });
        }
    }
}
