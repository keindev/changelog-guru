import TaskTree from 'tasktree-cli';

import { findSame, unify } from '../../utils/text';
import { ISection, SectionPosition } from '../entities/Section';
import { BaseRule, IRule, IRuleConfig, IRuleLintOptions, IRuleParseOptions, IRulePrepareOptions } from './BaseRule';

export interface ISectionGroupRuleConfig extends IRuleConfig {
  [key: string]: {
    emoji: string;
    types: string[];
  };
}

export default class SectionGroupRule extends BaseRule<ISectionGroupRuleConfig> implements IRule {
  #types: string[] = [];
  #blocks = new Map<string, ISection | undefined>();

  constructor(config: ISectionGroupRuleConfig) {
    super(config);

    this.#types = [...Object.values(this.config)].map(({ types }) => types).flat();

    if (this.#types.length > new Set(this.#types).size) {
      TaskTree.fail('One commit type assigned to {bold >2} sections');
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

  parse({ commit }: IRuleParseOptions): void {
    if (commit.type) {
      const name = findSame(commit.type, this.#types);

      if (name && this.#blocks.has(name)) {
        const block = this.#blocks.get(name);

        if (block) block.add(commit);
      }
    }
  }

  lint({ type, task }: IRuleLintOptions): void {
    if (type) {
      const key = findSame(type, this.#types);

      if (!key) task.error(`Commit type {bold ${type}} is not assigned with section`);
    }
  }
}
