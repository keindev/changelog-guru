import TaskTree from 'tasktree-cli';

import { findSame, unify } from '../../utils/text.js';
import { ISection, SectionPosition } from '../entities/Section.js';
import { BaseRule, IRule, IRuleConfig, IRuleLintOptions, IRuleParseOptions, IRulePrepareOptions } from './BaseRule.js';

export interface ISectionGroupRuleConfig extends IRuleConfig {
  [key: string]: {
    emoji: string;
    types: string[];
  };
}

export default class SectionGroupRule extends BaseRule<ISectionGroupRuleConfig> implements IRule {
  readonly #blocks = new Map<string, ISection | undefined>();
  readonly #types: string[] = [];

  constructor(config: ISectionGroupRuleConfig) {
    super(config);
    this.#types = [...Object.values(this.config)].map(({ types }) => types).flat();

    if (this.#types.length > new Set(this.#types).size) {
      TaskTree.fail('One commit type assigned to {bold >2} sections');
    }
  }

  lint({ type, task }: IRuleLintOptions): void {
    if (type) {
      const key = findSame(type, this.#types);

      if (!key) task.error(`Commit type {bold ${type}} is not assigned with section`);
    }
  }

  parse({ commit }: IRuleParseOptions): void {
    if (commit.type) {
      const name = findSame(commit.type, this.#types);

      if (name && this.#blocks.has(name)) {
        const block = this.#blocks.get(name);

        if (block) block.add(commit);
      }
    }
  }

  prepare({ context }: IRulePrepareOptions): void {
    Object.entries(this.config).forEach(([name, { emoji, types }], order) => {
      if (Array.isArray(types) && types.length) {
        const section = context.addSection({ name, position: SectionPosition.Body, order, emoji });

        if (section) types.forEach(type => this.#blocks.set(unify(type), section));
      }
    });
  }
}
