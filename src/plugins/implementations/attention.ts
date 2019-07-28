import { Task } from 'tasktree-cli/lib/task';
import { SemVer } from 'semver';
import { StatePlugin } from '../entities/plugin';
import { ConfigurationOptions, Configuration } from '../entities/configuration';
import { Section, Position } from '../entities/section';
import { Message } from '../entities/message';
import { Level, Modification } from '../utils/enums';
import { DependencyType } from '../entities/package/dependency';
import Markdown from '../utils/markdown';

export enum AttentionType {
    License = 'license',
    Engine = 'engine',
    Dependencies = 'dependencies',
    DevDependencies = 'devDependencies',
    PeerDependencies = 'peerDependencies',
    OptionalDependencies = 'optionalDependencies',
}

export enum AttentionTemplateLiteral {
    Name = '%name%',
    Version = '%ver%',
    PrevVersion = '%pver%',
    Value = '%val%',
    PrevValue = '%pval%',
}

export interface AttentionConfiguration extends ConfigurationOptions {
    attention: {
        title: string;
        templates: {
            [key in Modification]?: string;
        };
        sections: {
            [key in AttentionType]?: string;
        };
    };
}

export default class AttentionPlugin extends StatePlugin {
    private section: Section | undefined;
    private subtitles: Map<AttentionType, string> = new Map();
    private templates: Map<Modification, string> = new Map();

    private static getAttentionType(type: DependencyType, task?: Task): AttentionType | undefined {
        if (type === DependencyType.Engines) return AttentionType.Engine;
        if (type === DependencyType.Dependencies) return AttentionType.Dependencies;
        if (type === DependencyType.Dev) return AttentionType.DevDependencies;
        if (type === DependencyType.Peer) return AttentionType.PeerDependencies;
        if (type === DependencyType.Optional) return AttentionType.OptionalDependencies;

        if (task) task.fail('Incompatible PackageDependencyType');

        return undefined;
    }

    public async init(config: AttentionConfiguration): Promise<void> {
        const { attention } = config;

        if (attention) {
            this.section = this.context.addSection(attention.title, Position.Header);
            this.subtitles = new Map();
            this.templates = new Map();

            Configuration.fillFromEnum(attention.sections, AttentionType, this.subtitles);
            Configuration.fillFromEnum(attention.templates, Modification, this.templates);
        }
    }

    public async modify(task: Task): Promise<void> {
        const { section } = this;

        if (section) {
            this.addLicenseAttention(section, task);
            this.addDependencyAttentions(section, task);
        }
    }

    private addLicenseAttention(section: Section, task: Task): void {
        const license = this.context.getLicense();
        const subtitle = this.subtitles.get(AttentionType.License);

        if (subtitle && license && license.isChanged) {
            const subsection = new Section(subtitle, Position.Subsection);
            let text: string;

            if (license.prev) {
                task.warn(`License changed from ${license.prev} to ${license.id}.`);
                text = [
                    `License changed from ${Markdown.wrap(license.prev)} to ${Markdown.wrap(license.id)}.`,
                    `You can check it in ${Markdown.link(
                        'the full list of SPDX license IDs.',
                        'https://spdx.org/licenses/'
                    )}`,
                ].join(Markdown.WORD_SEPARATOR);
            } else {
                text = `Source code now under ${Markdown.wrap(license.id)} license.`;
                task.log(text);
            }

            subsection.add(new Message(text, Level.Major));
            section.add(subsection);
        }
    }

    private addDependencyAttentions(section: Section, task: Task): void {
        Object.values(DependencyType)
            .filter(Number)
            .forEach((dependencyType): void => {
                const dependencies = this.context.getDependencies(dependencyType);
                const attentionType = AttentionPlugin.getAttentionType(dependencyType, task);

                if (attentionType) {
                    const subtitle = this.subtitles.get(attentionType);

                    if (subtitle && dependencies) {
                        let text: string;
                        const replace = (l: string, v?: string | SemVer): string =>
                            v ? text.replace(l, Markdown.wrap(v)) : text;
                        const subsection = new Section(subtitle, Position.Subsection);
                        const list: string[] = [];

                        this.templates.forEach((template, type): void => {
                            if (template) {
                                dependencies.getModifications(type).forEach((modification): void => {
                                    const { name, value, version, prevValue, prevVersion } = modification;
                                    let link = dependencies.getLink(name);

                                    link = Markdown.bold(link ? Markdown.link(name, link) : name);
                                    text = template.replace(AttentionTemplateLiteral.Name, link);
                                    text = replace(AttentionTemplateLiteral.Value, value);
                                    text = replace(AttentionTemplateLiteral.Version, version);
                                    text = replace(AttentionTemplateLiteral.PrevValue, prevValue);
                                    text = replace(AttentionTemplateLiteral.PrevVersion, prevVersion);
                                    list.push(Markdown.listItem(text));
                                });
                            }
                        });

                        if (list.length) {
                            subsection.add(new Message(list.join(Markdown.LINE_SEPARATOR), Level.Patch));
                            section.add(subsection);
                            task.log(`${Markdown.capitalize(attentionType)} changed`);
                        }
                    }
                }
            });
    }
}
