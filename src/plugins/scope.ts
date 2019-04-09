import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Section from '../entities/section';
import Entity from '../entities/entity';

interface ScopeConfig extends Config {
    allowCustomScopes?: boolean;
    scopes: { [key: string]: string } | undefined;
}

class ScopeModifier extends Entity {
    public readonly index: number;

    public constructor(index: number) {
        super();

        this.index = index;
    }
}

export default class ScopePlugin extends AbstractPlugin {
    private readonly allowCustomScopes: boolean;
    private titles: string[] = [];
    private types: Map<string, number> = new Map();

    public constructor(config: ScopeConfig, state: State) {
        super(config, state);

        const { scopes, allowCustomScopes } = config;

        this.allowCustomScopes = !!allowCustomScopes;
        if (typeof scopes === 'object') {
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
        const { types, allowCustomScopes } = this;

        if (type.length) {
            if (types.has(type)) {
                this.addModifier(commit, new ScopeModifier(types.get(type) as number));
            } else if (allowCustomScopes) {
                this.types.set(type, this.titles.push(type) - 1);
                this.addModifier(commit, new ScopeModifier(types.get(type) as number));
                this.debug('add custom scope: %s', type);
            }
        }
    }

    public async modify(commit: Commit, modifier?: Entity): Promise<void> {
        const { index } = modifier as ScopeModifier;
        const { state: { sections } } = this;
        const section: Section | undefined = sections.add(this.titles[index], index);

        if (section) sections.assign(section, commit);
    }
}
