import { Task } from 'tasktree-cli/lib/task';
import { TaskTree } from 'tasktree-cli';
import Section, { SectionPosition, SectionOrder } from '../../core/entities/Section';
import Message from '../../core/entities/Message';
import Markdown from '../../utils/Markdown';
import { ChangeLevel } from '../../core/config/Config';
import { PackageRuleChangeType, PackageRuleType, IPackageRuleChange } from '../../core/package/rules/PackageRule';
import { DependencyRuleType, RestrictionRuleType } from '../../core/package/Package';
import Plugin, { IPluginConfig } from '../Plugin';

export enum AttentionTemplateLiteral {
    Name = '%name%',
    Version = '%ver%',
    PrevVersion = '%pver%',
    Value = '%val%',
    PrevValue = '%pval%',
}

const changes = Object.values<string>(PackageRuleChangeType);
const subtitles = {
    [DependencyRuleType.Engines]: 'Engines',
    [DependencyRuleType.Dependencies]: 'Dependencies',
    [DependencyRuleType.DevDependencies]: 'Dev Dependencies',
    [DependencyRuleType.OptionalDependencies]: 'Optional Dependencies',
    [DependencyRuleType.PeerDependencies]: 'Peer Dependencies',
    [RestrictionRuleType.BundledDependencies]: 'Bundled Dependencies',
    [RestrictionRuleType.CPU]: 'CPU',
    [RestrictionRuleType.OS]: 'OS',
};
const renderListItem = (template: string, { name, link, ...change }: IPackageRuleChange, task?: Task): string => {
    const text = template.replace(/%[a-z]{3,4}%/g, (substring): string => {
        switch (substring) {
            case AttentionTemplateLiteral.Name:
                return Markdown.bold(link ? Markdown.link(name, link) : name);
            case AttentionTemplateLiteral.Value:
                return Markdown.wrap(change.value);
            case AttentionTemplateLiteral.Version:
                return Markdown.wrap(change.version);
            case AttentionTemplateLiteral.PrevValue:
                return Markdown.wrap(change.prevValue);
            case AttentionTemplateLiteral.PrevVersion:
                return Markdown.wrap(change.prevVersion);
            default:
                (task || TaskTree).fail(`Unexpected template literal: {bold ${substring}}`);
                break;
        }

        return substring;
    });

    return Markdown.listItem(text);
};

export default class PackageChangesInformer extends Plugin {
    private main: Section | undefined;
    private sections: PackageRuleType[] = [];
    private templates = new Map<string, string>();

    public async init(config: IPluginConfig): Promise<void> {
        const { title, templates, sections } = config as {
            title: string;
            templates: { [key in PackageRuleChangeType]: string };
            sections: PackageRuleType[];
        };

        if (this.context) {
            this.main = this.context.addSection(title, SectionPosition.Header);
            this.templates = new Map(Object.entries(templates).filter(([name]) => changes.includes(name)));
            this.sections = [...new Set(sections)];

            if (this.main) this.main.order = SectionOrder.Min;
        }
    }

    public async modify(task: Task): Promise<void> {
        const { main } = this;

        if (main) {
            this.createLicenseAttention(main, task);
            this.crateRuleAttention(main, task);
        }
    }

    private createLicenseAttention(section: Section, task: Task): void {
        const { context } = this;

        if (context) {
            const license = context.getLicense();

            if (license && license.isChanged) {
                const subsection = new Section('License', SectionPosition.Subsection);
                const { id, prev } = license;
                let message: Message;

                task.warn(`License changed from {bold.underline ${prev}} to {bold.underline ${id}}.`);

                if (prev) {
                    message = new Message(
                        `License changed from ${Markdown.wrap(prev)} to ${Markdown.wrap(
                            id
                        )}. You can check it in ${Markdown.link(
                            'the full list of SPDX license IDs.',
                            'https://spdx.org/licenses/'
                        )}`
                    );
                    message.changeLevel = ChangeLevel.Major;
                } else {
                    message = new Message(`Source code now under ${Markdown.wrap(id)} license.`);
                }

                subsection.add(message);
                section.add(subsection);
            }
        }
    }

    private crateRuleAttention(section: Section, task: Task): void {
        const { context, sections } = this;
        const templates = [...this.templates.entries()];

        if (context) {
            [...sections.values()].forEach((type, order) => {
                const rule = context.getPackageRule(type);

                if (rule) {
                    const text = templates.reduce((acc, [name, value]) => {
                        return [acc, ...rule.getChanges(value).map(change => renderListItem(name, change, task))].join(
                            Markdown.LINE_SEPARATOR
                        );
                    }, '');

                    if (text) {
                        const subsection = new Section(subtitles[type], SectionPosition.Subsection, order);

                        subsection.add(new Message(text));
                        section.add(subsection);
                    }
                }
            });
        }
    }
}
