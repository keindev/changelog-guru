import { CommitPlugin } from '../../commit-plugin';
import { ScopePluginOptions } from './typings/types';
import { Commit } from '../../../entities/commit';
import Key from '../../../utils/key';

export default class ScopePlugin extends CommitPlugin {
    private onlyPresented: boolean = false;
    private titles: Map<string, string> = new Map();

    public async init(config: ScopePluginOptions): Promise<void> {
        this.onlyPresented = !!config.onlyPresented;
        this.titles = new Map(
            Object.entries(config.titles).map(([name, title]): [string, string] => [Key.unify(name), title])
        );
    }

    public async parse(commit: Commit): Promise<void> {
        const scope = commit.getScope();

        if (scope) {
            let accent: string | undefined;

            scope.split(',').forEach((name): void => {
                accent = Key.inMap(name, this.titles);

                if (accent || (!this.onlyPresented && name.length)) {
                    commit.addAccent((accent || name).trim());
                }
            });
        }
    }
}
