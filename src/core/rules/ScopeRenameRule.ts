import { findSame, unify } from '../../utils/text';
import { BaseRule, IRule, IRuleConfig, IRuleLintOptions, IRuleParseOptions } from './BaseRule';

const MIN_SCOPE_SHORTNAME_LENGTH = 2;

export interface IScopeRenameRuleConfig extends IRuleConfig {
  onlyPresented: boolean;
  names: {
    [key: string]: string;
  };
}

export default class ScopeRenameRule extends BaseRule<IScopeRenameRuleConfig> implements IRule {
  #onlyPresented = false;
  #names = new Map<string, string>();

  constructor(config: IScopeRenameRuleConfig) {
    super(config);

    this.#onlyPresented = config.onlyPresented;
    this.#names = new Map(Object.entries(config.names).map(([abbr, name]) => [unify(abbr), name]));
  }

  parse({ commit }: IRuleParseOptions): void {
    if (commit.scope) {
      const scopes = commit.scope.split(',');

      scopes.forEach(name => {
        const actualName = findSame(name, [...this.#names.keys()]);
        const accent = actualName ? this.#names.get(actualName) : undefined;

        if (accent || (!this.#onlyPresented && name.length)) commit.accent((accent || name).trim());
      });
    }
  }

  lint({ scope, task }: IRuleLintOptions): void {
    const names = [...this.#names.keys()];

    if (scope.length) {
      scope.split(',').forEach(name => {
        if (name.length < MIN_SCOPE_SHORTNAME_LENGTH) task.error(`Scope name {bold ${name}} is too short`);
        if (this.#onlyPresented && !findSame(name, names)) task.error(`Scope {bold ${name}} is not available`);
      });
    }
  }
}
