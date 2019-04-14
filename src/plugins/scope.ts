import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config, { ConfigOption } from '../io/config';
import Key from '../utils/key';
import { SectionPosition } from '../entities/section';

interface ScopeOptionConfig extends ConfigOption {
    only: boolean | undefined;
    list: ConfigOption;
}

interface ScopeConfig extends Config {
    scopes: ScopeOptionConfig;
}

export default class ScopePlugin extends AbstractPlugin {
    private scopes: Set<string> = new Set();
    private onlyConfiguredScopes: boolean = false;

    public constructor(config: ScopeConfig, state: State) {
        super(config, state);

        const { scopes } = config;

        if (typeof scopes === 'object') {
            const { only, list } = scopes;

            this.onlyConfiguredScopes = !!only;

            if (typeof list === 'object') {
                Object.keys(list).forEach((name: string): void => {
                    const title = list[name];

                    if (typeof title === 'string' && !this.scopes.has(name)) {
                        const key: string = Key.unify(name);

                        this.scopes.add(key);
                        this.createSection(key, SectionPosition.Subgroup, title);
                    }
                });
            }
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const scope: string = commit.getScope();

        if (scope.length) {
            const { scopes, onlyConfiguredScopes } = this;
            const isConfiguredScope = Key.inSet(scope, scopes);

            if (!onlyConfiguredScopes && !isConfiguredScope) this.createSection(scope, SectionPosition.Subgroup);
            if (isConfiguredScope || !onlyConfiguredScopes) this.assignSection(scope, commit);
        }
    }
}
