import { findSame, unify } from '../../utils/text';
import { ISection, SectionPosition } from '../entities/Section';
import { BaseRule, IRule, IRuleConfig, IRuleLintOptions, IRuleParseOptions, IRulePrepareOptions } from './BaseRule';

export interface ISectionGroupRuleConfig extends IRuleConfig {
  [key: string]: string[];
}

export default class SectionGroupRule extends BaseRule<ISectionGroupRuleConfig> implements IRule {
  #blocks = new Map<string, ISection>();

  prepare({ context }: IRulePrepareOptions): void {
    Object.entries(this.config).forEach(([name, types], order) => {
      if (Array.isArray(types) && types.length) {
        const section = context.addSection(name, SectionPosition.Body, order);

        if (section) (types as string[]).forEach(type => this.#blocks.set(unify(type), section));
      }
    });
  }

  parse({ commit }: IRuleParseOptions): void {
    if (commit.type) {
      const name = findSame(commit.type, [...this.#blocks.keys()]);

      if (name && this.#blocks.has(name)) {
        const block = this.#blocks.get(name);

        if (block) block.add(commit);
      }
    }
  }

  lint({ type, task }: IRuleLintOptions): void {
    const key = findSame(type, [...this.#blocks.keys()]);

    if (!key) task.error(`Commit type {bold ${type}} is not assigned with section`);
  }
}
