import { BaseRule, IRule, IRuleConfig, IRuleParseOptions } from './BaseRule';

export interface IHighlightRuleConfig extends IRuleConfig {
  camelCase: boolean;
  masks: string[];
}

export default class HighlightRule extends BaseRule<IHighlightRuleConfig> implements IRule {
  #masks: RegExp[] = [];

  constructor(config: IHighlightRuleConfig) {
    super(config);

    this.#masks = [...config.masks, config.camelCase ? /[A-Za-z]+[A-Z]+[a-z]+/ : '']
      .filter(Boolean)
      .map(mask => new RegExp(mask, 'g'));
  }

  parse({ commit }: IRuleParseOptions): void {
    const { subject } = commit;
    let match: RegExpExecArray | null;

    this.#masks.forEach(mask => {
      while ((match = mask.exec(subject)) !== null) if (match[0]) commit.replacement(match[0], match.index);
    });
  }
}
