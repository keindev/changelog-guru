import { ChangeType, Dependencies, IChange, Restriction } from 'package-json-helper/types/package';
import TaskTree from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/Task';

import md from '../../utils/markdown.js';
import { ChangeLevel } from '../entities/Entity.js';
import Message from '../entities/Message.js';
import Section, { ISection, SectionOrder, SectionPosition } from '../entities/Section.js';
import { BaseRule, IRule, IRuleConfig, IRuleModifyOptions } from './BaseRule.js';

export enum TemplateLiteral {
  Name = '%name%',
  Value = '%val%',
  PrevValue = '%pval%',
}

export interface IPackageStatisticRenderRuleConfig extends IRuleConfig {
  sections: (Dependencies | Restriction)[];
  templates: {
    [key in ChangeType]: string;
  };
  title: string;
}

const SECTION_TITLES_MAP = {
  [Dependencies.Engines]: 'Engines',
  [Dependencies.Dependencies]: 'Dependencies',
  [Dependencies.DevDependencies]: 'Dev Dependencies',
  [Dependencies.OptionalDependencies]: 'Optional Dependencies',
  [Dependencies.PeerDependencies]: 'Peer Dependencies',
  [Restriction.BundledDependencies]: 'Bundled Dependencies',
  [Restriction.CPU]: 'CPU',
  [Restriction.OS]: 'OS',
};

const COLLAPSIBLE_SECTIONS_MAP = [
  Dependencies.Dependencies,
  Dependencies.DevDependencies,
  Dependencies.OptionalDependencies,
  Dependencies.PeerDependencies,
  Restriction.BundledDependencies,
];

export default class PackageStatisticRenderRule extends BaseRule<IPackageStatisticRenderRuleConfig> implements IRule {
  readonly #sections: (Dependencies | Restriction)[] = [];
  readonly #templates: [string, string][];

  constructor(config: IPackageStatisticRenderRuleConfig) {
    super(config);

    const changes = Object.values<string>(ChangeType);

    this.#templates = Object.entries(config.templates).filter(([type]) => changes.includes(type));
    this.#sections = [...new Set(config.sections)];
  }

  modify({ task, context }: IRuleModifyOptions): void {
    const section = context.addSection({ name: this.config.title, position: SectionPosition.Header });
    const dependencies = new Section({
      name: 'Dependencies',
      position: SectionPosition.Subsection,
      order: this.#sections.length,
    });

    if (section) {
      section.order = SectionOrder.Min;
      this.createLicenseSection({ context, task, section });

      [...this.#sections.values()].forEach((type, order) => {
        const changes = context.getChanges(type);

        if (changes?.length) {
          const text = this.renderChanges(changes, task);

          if (text) {
            const isDetails = COLLAPSIBLE_SECTIONS_MAP.includes(type);
            const position = isDetails ? SectionPosition.Details : SectionPosition.Subsection;
            const subsection = new Section({ name: SECTION_TITLES_MAP[type], position, order });

            subsection.add(new Message(text));
            (isDetails ? dependencies : section).add(subsection);
          }
        }
      });

      if (dependencies.sections.length) section.add(dependencies);
    }
  }

  private createLicenseSection({ task, context, section }: IRuleModifyOptions & { section: ISection }): void {
    if (context.hasChangedLicense) {
      const subsection = new Section({ name: 'License', position: SectionPosition.Subsection });
      const { currentLicense, previousLicense } = context;
      const message = previousLicense
        ? `License changed from ${md.license(previousLicense)} to ${md.license(currentLicense)}.`
        : `Source code now under ${md.wrap(currentLicense)} license.`;

      task.warn(`License changed from {bold.underline ${previousLicense}} to {bold.underline ${currentLicense}}.`);
      subsection.add(new Message(message, ChangeLevel.Major));
      section.add(subsection);
    }
  }

  private renderChanges(changes: IChange[], task: Task): string {
    return this.#templates.reduce((acc, [type, template]) => {
      const items = changes
        .filter(change => change.type === type)
        .map(({ name, link, ...change }) =>
          md.list(
            template.replace(/%[a-z]{3,4}%/g, (substring): string => {
              switch (substring) {
                case TemplateLiteral.Name:
                  return md.strong(link ? md.link(name, link) : name);
                case TemplateLiteral.Value:
                  return md.wrap(change.value.current);
                case TemplateLiteral.PrevValue:
                  return md.wrap(change.value.previous);
                default:
                  (task || TaskTree).fail(`Unexpected template literal: {bold ${substring}}`);
                  break;
              }

              return substring;
            })
          )
        );

      return [acc, ...items].join('\n');
    }, '');
  }
}
