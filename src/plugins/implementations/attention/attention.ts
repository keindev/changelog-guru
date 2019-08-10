import { Task } from 'tasktree-cli/lib/task';
import { TaskTree } from 'tasktree-cli';
import { StatePlugin } from '../../state-plugin';
import { AttentionPluginOptions } from './typings/types';
import { SectionPosition, SectionOrder } from '../../../entities/typings/enums';
import { ConfigUtils } from '../../../config/utils';
import { Section } from '../../../entities/section';
import { Message } from '../../../entities/message';
import Markdown from '../../../utils/markdown';
import { ChangeLevel } from '../../../config/typings/enums';
import { PackageRuleType } from '../../../package/typings/types';
import { PackageRuleChangeType, DependencyRuleType, RestrictionRuleType } from '../../../package/rules/typings/enums';
import { AttentionTemplateLiteral } from './typings/enums';
import { PackageRuleChange } from '../../../package/rules/typings/types';
import { PackageRule } from '../../../package/rules/package-rule';

export default class AttentionPlugin extends StatePlugin {
    private section: Section | undefined;
    private templates: Map<PackageRuleChangeType, string> = new Map();
    private sections: Set<PackageRuleType> = new Set();

    public static getSubtitle(type: PackageRuleType, task?: Task): string {
        let subtitle: string | undefined;

        switch (type) {
            case DependencyRuleType.Engines:
                subtitle = 'Engines';
                break;
            case DependencyRuleType.Dependencies:
                subtitle = 'Dependencies';
                break;
            case DependencyRuleType.DevDependencies:
                subtitle = 'Dev Dependencies';
                break;
            case DependencyRuleType.OptionalDependencies:
                subtitle = 'Optional Dependencies';
                break;
            case DependencyRuleType.PeerDependencies:
                subtitle = 'Peer Dependencies';
                break;
            case RestrictionRuleType.BundledDependencies:
                subtitle = 'Bundled Dependencies';
                break;
            case RestrictionRuleType.CPU:
                subtitle = 'CPU';
                break;
            case RestrictionRuleType.OS:
                subtitle = 'OS';
                break;
            default:
                (task || TaskTree).fail('Unexpected package rule type!');
                break;
        }

        return subtitle as string;
    }

    public static renderTemplate(template: string, change: PackageRuleChange, task?: Task): string {
        const { name, link } = change;
        const text = template.replace(/%[a-z]{3,4}%/g, (substring): string => {
            let result = substring;

            switch (substring) {
                case AttentionTemplateLiteral.Name:
                    result = Markdown.bold(link ? Markdown.link(name, link) : name);
                    break;
                case AttentionTemplateLiteral.Value:
                    result = Markdown.wrap(change.value);
                    break;
                case AttentionTemplateLiteral.Version:
                    result = Markdown.wrap(change.version);
                    break;
                case AttentionTemplateLiteral.PrevValue:
                    result = Markdown.wrap(change.prevValue);
                    break;
                case AttentionTemplateLiteral.PrevVersion:
                    result = Markdown.wrap(change.prevVersion);
                    break;
                default:
                    (task || TaskTree).fail(`Unexpected template literal: ${substring}`);
                    break;
            }

            return result;
        });

        return Markdown.listItem(text);
    }

    public async init(config: AttentionPluginOptions): Promise<void> {
        this.section = this.context.addSection(config.title, SectionPosition.Header);
        this.templates = new Map();
        this.sections = new Set();

        if (this.section) {
            this.section.setOrder(SectionOrder.Min);
            ConfigUtils.fillFromEnum(config.templates, PackageRuleChangeType, this.templates);
            config.sections.forEach((type): void => {
                this.sections.add(type);
            });
        }
    }

    public async modify(task: Task): Promise<void> {
        const { section } = this;

        if (section) {
            this.createLicenseAttention(section, task);
            this.crateRuleAttention(section, task);
        }
    }

    private createLicenseAttention(section: Section, task: Task): void {
        const license = this.context.getLicense();

        if (license && license.isChanged) {
            task.warn(`License changed from ${license.prev} to ${license.id}.`);

            const subsection = new Section('License', SectionPosition.Subsection);
            let message: Message;

            if (license.prev) {
                message = new Message(
                    [
                        `License changed from ${Markdown.wrap(license.prev)} to ${Markdown.wrap(license.id)}.`,
                        `You can check it in ${Markdown.link(
                            'the full list of SPDX license IDs.',
                            'https://spdx.org/licenses/'
                        )}`,
                    ].join(Markdown.WORD_SEPARATOR)
                );
                message.setChangeLevel(ChangeLevel.Major);
            } else {
                message = new Message(`Source code now under ${Markdown.wrap(license.id)} license.`);
            }

            message.escape();
            subsection.add(message);
            section.add(subsection);
        }
    }

    private crateRuleAttention(section: Section, task: Task): void {
        let subsection: Section;
        let message: Message;
        let rule: PackageRule | undefined;
        let changes: PackageRuleChange[];
        let list: string[];
        let order = 0;

        this.sections.forEach((type): void => {
            rule = this.context.getPackageRule(type);

            if (rule) {
                subsection = new Section(AttentionPlugin.getSubtitle(type, task), SectionPosition.Subsection);
                list = [];

                this.templates.forEach((template, changeType): void => {
                    changes = (rule as PackageRule).getChanges(changeType);

                    if (changes.length) {
                        list.push(
                            ...changes.map((change): string => AttentionPlugin.renderTemplate(template, change, task))
                        );
                    }
                });

                if (list.length) {
                    message = new Message(list.join(Markdown.LINE_SEPARATOR));
                    message.escape();
                    subsection.setOrder(order++);
                    subsection.add(message);
                    section.add(subsection);
                }
            }
        });
    }
}