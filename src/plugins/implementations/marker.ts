import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import { PluginOption } from '../../config/config';
import { CommitPlugin } from '../commit-plugin';
import { Section, SectionPosition, SectionOrder } from '../../entities/section';
import { Commit, CommitStatus } from '../../entities/commit';
import Key from '../../utils/key';

export enum MarkerType {
    // !break - indicates major changes breaking backward compatibility
    Breaking = 'break',
    // !deprecate- place a commit title to special section with deprecated properties
    Deprecated = 'deprecated',
    // !group(NAME) - creates a group of commits with the <NAME>
    Grouped = 'group',
    // !ignore - ignore a commit in output
    Ignore = 'ignore',
    // !important - place a commit title to special section on top of changelog
    Important = 'important',
}

export interface MarkerPluginOptions extends PluginOption {
    actions: (MarkerType.Ignore | MarkerType.Grouped)[];
    joins: {
        [key in MarkerType.Breaking | MarkerType.Deprecated | MarkerType.Important]: string;
    };
}

export default class MarkerPlugin extends CommitPlugin {
    private static EXPRESSION = /!(?<type>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;

    private markers: Set<MarkerType> = new Set();
    private sections: Map<MarkerType, Section> = new Map();

    public async init(config: MarkerPluginOptions): Promise<void> {
        this.markers = new Set();
        this.sections = new Map();

        config.actions.forEach((action): void => {
            switch (action) {
                case MarkerType.Ignore:
                case MarkerType.Grouped:
                    this.markers.add(action);
                    break;
                default:
                    TaskTree.fail(`Unexpected marker type - ${action}`);
                    break;
            }
        });

        let position: SectionPosition = SectionPosition.None;

        Object.entries(config.joins).forEach(([join, title]): void => {
            switch (join) {
                case MarkerType.Breaking:
                case MarkerType.Deprecated:
                    position = SectionPosition.Header;
                    break;
                case MarkerType.Important:
                    position = SectionPosition.Body;
                    break;
                default:
                    position = SectionPosition.None;
                    TaskTree.fail(`Unexpected marker type - ${join}`);
                    break;
            }

            if (position !== SectionPosition.None) {
                const section = this.context.addSection(title, position);

                if (section) {
                    section.setOrder(SectionOrder.Min);
                    this.markers.add(join as MarkerType);
                    this.sections.set(join as MarkerType, section);
                }
            }
        });
    }

    public async parse(commit: Commit, task: Task): Promise<void> {
        const expression = MarkerPlugin.EXPRESSION;
        let match: RegExpExecArray | null;
        let marker: MarkerType | undefined;
        let section: Section | undefined;

        commit.body.forEach((line): void => {
            do {
                match = expression.exec(line);

                if (match && match.groups && match.groups.type) {
                    const { type, value } = match.groups;

                    marker = Key.getEqual(type, [...this.markers]) as MarkerType | undefined;

                    if (marker) {
                        section = this.sections.get(marker);

                        switch (marker) {
                            case MarkerType.Breaking:
                                commit.setStatus(CommitStatus.BreakingChanges);
                                break;
                            case MarkerType.Deprecated:
                                commit.setStatus(CommitStatus.Deprecated);
                                break;
                            case MarkerType.Important:
                                commit.setStatus(CommitStatus.Important);
                                break;
                            case MarkerType.Ignore:
                                commit.ignore();
                                break;
                            case MarkerType.Grouped:
                                section = this.context.addSection(value, SectionPosition.Group);
                                break;
                            default:
                                task.fail(`Unexpected marker type - ${type}`);
                                break;
                        }

                        if (section) {
                            section.add(commit);
                        }
                    }
                }
            } while (match && expression.lastIndex);
        });
    }
}
