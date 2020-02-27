import { Task } from 'tasktree-cli/lib/Task';
import { TaskTree } from 'tasktree-cli';
import Section, { Position, Order } from '../../core/entities/Section';
import Message from '../../core/entities/Message';
import * as md from '../../utils/Markdown';
import Plugin, { IPluginConfig } from '../Plugin';
import { Dependency, Restriction, ChangeType, IChange } from '../../core/Package';
import { ChangeLevel } from '../../core/Config';

export enum AttentionTemplateLiteral {
    Name = '%name%',
    Version = '%ver%',
    PrevVersion = '%pver%',
    Value = '%val%',
    PrevValue = '%pval%',
}

const subtitles = {
    [Dependency.Engines]: 'Engines',
    [Dependency.Dependencies]: 'Dependencies',
    [Dependency.DevDependencies]: 'Dev Dependencies',
    [Dependency.OptionalDependencies]: 'Optional Dependencies',
    [Dependency.PeerDependencies]: 'Peer Dependencies',
    [Restriction.BundledDependencies]: 'Bundled Dependencies',
    [Restriction.CPU]: 'CPU',
    [Restriction.OS]: 'OS',
};
const renderListItem = (template: string, { name, link, ...change }: IChange, task?: Task): string => {
    const text = template.replace(/%[a-z]{3,4}%/g, (substring): string => {
        switch (substring) {
            case AttentionTemplateLiteral.Name:
                return md.strong(link ? md.link(name, link) : name);
            case AttentionTemplateLiteral.Value:
                return md.wrap(change.value);
            case AttentionTemplateLiteral.Version:
                return md.wrap(change.version);
            case AttentionTemplateLiteral.PrevValue:
                return md.wrap(change.prevValue);
            case AttentionTemplateLiteral.PrevVersion:
                return md.wrap(change.prevVersion);
            default:
                (task || TaskTree).fail(`Unexpected template literal: {bold ${substring}}`);
                break;
        }

        return substring;
    });

    return md.list(text);
};

export default class PackageStatistic extends Plugin {
    private main: Section | undefined;
    private sections: (Dependency | Restriction)[] = [];
    private templates = new Map<string, string>();

    async init(config: IPluginConfig): Promise<void> {
        const { title, templates, sections } = config as {
            title: string;
            templates: { [key in ChangeType]: string };
            sections: (Dependency | Restriction)[];
        };

        if (this.context) {
            const changes = Object.values<string>(ChangeType);

            this.main = this.context.addSection(title, Position.Header);
            this.templates = new Map(Object.entries(templates).filter(([name]) => changes.includes(name)));
            this.sections = [...new Set(sections)];

            if (this.main) this.main.order = Order.Min;
        }
    }

    async modify(task: Task): Promise<void> {
        const { main } = this;

        if (main) {
            this.createLicenseAttention(main, task);
            this.crateRuleAttention(main, task);
        }
    }

    private createLicenseAttention(section: Section, task: Task): void {
        const { context } = this;

        if (context?.license?.isChanged) {
            const subsection = new Section('License', Position.Subsection);
            const { id, prev } = context.license;
            let message: Message;

            task.warn(`License changed from {bold.underline ${prev}} to {bold.underline ${id}}.`);

            if (prev) {
                message = new Message(`License changed from ${md.licenseLink(prev)} to ${md.licenseLink(id)}.`);
                message.level = ChangeLevel.Major;
            } else {
                message = new Message(`Source code now under ${md.wrap(id)} license.`);
            }

            subsection.add(message);
            section.add(subsection);
        }
    }

    private crateRuleAttention(section: Section, task: Task): void {
        const { context, sections } = this;
        const templates = [...this.templates.entries()];

        if (context) {
            [...sections.values()].forEach((type, order) => {
                const changes = context.getChanges(type);

                if (changes) {
                    const text = templates.reduce(
                        (acc, [name, value]) =>
                            [
                                acc,
                                ...changes
                                    .filter(change => change.type === value)
                                    .map(change => renderListItem(name, change, task)),
                            ].join('\n'),
                        ''
                    );

                    if (text) {
                        const subsection = new Section(subtitles[type], Position.Subsection, order);

                        subsection.add(new Message(text));
                        section.add(subsection);
                    }
                }
            });
        }
    }
}
