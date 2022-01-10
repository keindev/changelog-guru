import {
    IPackageChange, PackageDependency, PackageDependencyChangeType, PackageRestriction,
} from 'package-json-helper/lib/types';
import TaskTree from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/Task';

import md from '../../utils/markdown';
import { ChangeLevel } from '../entities/Entity';
import Message from '../entities/Message';
import Section, { ISection, SectionOrder, SectionPosition } from '../entities/Section';
import { BaseRule, IRule, IRuleConfig, IRuleModifyOptions } from './BaseRule';

export enum TemplateLiteral {
  Name = '%name%',
  Value = '%val%',
  PrevValue = '%pval%',
}

export interface IPackageStatisticRenderRuleConfig extends IRuleConfig {
  sections: (PackageDependency | PackageRestriction)[];
  templates: {
    [key in PackageDependencyChangeType]: string;
  };
  title: string;
}

const SECTION_TITLES_MAP = {
  [PackageDependency.Engines]: 'Engines',
  [PackageDependency.Dependencies]: 'Dependencies',
  [PackageDependency.DevDependencies]: 'Dev Dependencies',
  [PackageDependency.OptionalDependencies]: 'Optional Dependencies',
  [PackageDependency.PeerDependencies]: 'Peer Dependencies',
  [PackageRestriction.BundledDependencies]: 'Bundled Dependencies',
  [PackageRestriction.CPU]: 'CPU',
  [PackageRestriction.OS]: 'OS',
};

const COLLAPSIBLE_SECTIONS_MAP = [
  PackageDependency.Dependencies,
  PackageDependency.DevDependencies,
  PackageDependency.OptionalDependencies,
  PackageDependency.PeerDependencies,
  PackageRestriction.BundledDependencies,
];

export default class PackageStatisticRenderRule extends BaseRule<IPackageStatisticRenderRuleConfig> implements IRule {
  #sections: (PackageDependency | PackageRestriction)[] = [];
  #templates: [string, string][];

  constructor(config: IPackageStatisticRenderRuleConfig) {
    super(config);

    const changes = Object.values<string>(PackageDependencyChangeType);

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

  private renderChanges(changes: IPackageChange[], task: Task): string {
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
