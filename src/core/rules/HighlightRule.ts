import { BaseRule, IRule, IRuleConfig, IRuleParseOptions } from './BaseRule';

export interface IHighlightRuleConfig extends IRuleConfig {
  masks: string[];
  camelCase: boolean;
}

export default class HighlightRule extends BaseRule<IHighlightRuleConfig> implements IRule {
  #masks: RegExp[] = [];

  constructor(config: IHighlightRuleConfig) {
    super(config);

    this.#masks = [...config.masks, config.camelCase ? /[A-Za-z]+[A-Z]+[a-z]+/g : '']
      .filter(Boolean)
      .map(mask => new RegExp(mask, 'gi'));
  }

  parse({ commit }: IRuleParseOptions): void {
    let match: RegExpExecArray | null;

    this.#masks.forEach(mask => {
      while ((match = mask.exec(commit.subject)) !== null) if (match[0]) commit.replacement(match[0], match.index);
    });
  }
}
