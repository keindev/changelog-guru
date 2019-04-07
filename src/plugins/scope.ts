import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';

interface ScopeConfig extends Config {
    scopes: { [key: string]: string } | undefined;
}

class ScopeModifier extends Entity {
    public readonly index: number;

    public constructor(index: number) {
        super();

        this.index = index;
    }
}

export default class Scope extends AbstractPlugin {
    private titles: string[] = [];
    private types: Map<string, number> = new Map();

    public constructor(config: ScopeConfig) {
        super(config);

        const { scopes } = config;

        if (Array.isArray(scopes)) {
            Object.keys(scopes).forEach((type: string): void => {
                if (!this.types.has(type) && typeof scopes[type] === 'string') {
                    this.debug('append: %s', scopes[type]);
                    this.types.set(type, this.titles.push(scopes[type]) - 1);
                }
            });
        }
    }

    public parse(commit: Commit): void {
        const type: string = commit.getScope();
        const { types } = this;

        if (type.length && types.has(type)) {
            this.addModifier(commit, new ScopeModifier(types.get(type) as number));
        }
    }

    public async modify(state: State, commit: Commit, modifier?: Entity): Promise<void> {
        const { index } = modifier as ScopeModifier;

        state.group(this.titles[index], commit);
    }
}
