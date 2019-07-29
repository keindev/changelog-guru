import { Task } from 'tasktree-cli/lib/task';
import { SemVer } from 'semver';
import { DependencyModification, DependencyType } from '../../../package/typings/enums';
import { Section } from '../../../entities/section';
import { StatePlugin } from '../../state-plugin';
import { AttentionPluginOptions } from './typings/types';
import { AttentionType, AttentionTemplateLiteral } from './typings/enums';
import { SectionPosition } from '../../../entities/typings/enums';
import Markdown from '../../../utils/markdown';
import { Message } from '../../../entities/message';
import { ChangeLevel } from '../../../config/typings/enums';

export default class AttentionPlugin extends StatePlugin {
    private section: Section | undefined;
    private subtitles: Map<AttentionType, string> = new Map();
    private templates: Map<DependencyModification, string> = new Map();

    private static getAttentionType(type: DependencyType, task?: Task): AttentionType | undefined {
        if (type === DependencyType.Engines) return AttentionType.Engine;
        if (type === DependencyType.Dependencies) return AttentionType.Dependencies;
        if (type === DependencyType.Dev) return AttentionType.DevDependencies;
        if (type === DependencyType.Peer) return AttentionType.PeerDependencies;
        if (type === DependencyType.Optional) return AttentionType.OptionalDependencies;

        if (task) task.fail('Incompatible PackageDependencyType');

        return undefined;
    }

    public async init(config: AttentionPluginOptions): Promise<void> {
        const { attention } = config;

        this.section = undefined;
        this.subtitles = new Map();
        this.templates = new Map();

        if (attention) {
            this.section = this.context.addSection(attention.title, SectionPosition.Header);
            Configuration.fillFromEnum(attention.sections, AttentionType, this.subtitles);
            Configuration.fillFromEnum(attention.templates, DependencyModification, this.templates);
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
            task.warn(`License changed from ${license.prev} to ${license.id}.`);

            const subsection = new Section(subtitle, SectionPosition.Subsection);
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

            subsection.add(message);
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
                        const subsection = new Section(subtitle, SectionPosition.Subsection);
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
                            subsection.add(new Message(list.join(Markdown.LINE_SEPARATOR)));
                            section.add(subsection);
                            task.log(`${Markdown.capitalize(attentionType)} changed`);
                        }
                    }
                }
            });
    }
}
