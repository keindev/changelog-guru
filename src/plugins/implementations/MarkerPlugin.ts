import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import { IPluginOption } from '../../config/Config';
import CommitPlugin from '../CommitPlugin';
import Section, { SectionPosition, SectionOrder } from '../../entities/Section';
import Commit, { CommitStatus } from '../../entities/Commit';
import Key from '../../utils/Key';
import { PluginLintOptions } from '../../Linter';

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

export interface IMarkerPluginOptions extends IPluginOption {
    actions: (MarkerType.Ignore | MarkerType.Grouped)[];
    joins: {
        [key in MarkerType.Breaking | MarkerType.Deprecated | MarkerType.Important]: string;
    };
}

export default class MarkerPlugin extends CommitPlugin {
    private markers: Set<MarkerType> = new Set();
    private sections: Map<MarkerType, Section> = new Map();

    // FIXME: make init shorter
    // eslint-disable-next-line max-lines-per-function
    public async init(config: IMarkerPluginOptions): Promise<void> {
        this.markers = new Set();
        this.sections = new Map();

        config.actions.forEach(action => {
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

        Object.entries(config.joins).forEach(([join, title]) => {
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
                    TaskTree.fail(`Unexpected marker type - {bold ${join}}`);
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
        const markers = this.getMarkersFrom(commit.body[0]);
        let section: Section | undefined;

        markers.forEach(([marker, type, value]) => {
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
                    if (value) section = this.context.addSection(value, SectionPosition.Group);
                    break;
                default:
                    task.fail(`Unexpected marker - {bold !${type}}`);
                    break;
            }

            if (section) {
                section.add(commit);
            }
        });
    }

    public lint(options: PluginLintOptions, task: Task): void {
        const { body } = options;
        const markersLine = body[0];
        const blackLine = body[1];
        const bodyFirstLine = body[2];
        const markers = this.getMarkersFrom(markersLine);
        const types: string[] = Object.values(MarkerType);

        if (markers.length) {
            task.log(`Markers: ${markersLine}`);

            markers.forEach(([marker, type, value]) => {
                if (!types.some(name => name === marker)) task.error(`Unexpected marker {bold !${type}}`);
                if (marker === MarkerType.Grouped && !value) task.error(`{bold !group} name is empty`);
            });

            if (bodyFirstLine && blackLine.trim().length) task.error('Missing blank line between markers and body');
        } else if (markersLine && markersLine.length) {
            task.error('Missing blank line between header and body');
        }
    }

    private getMarkersFrom(text?: string): [MarkerType, string, string][] {
        const markers: [MarkerType, string, string][] = [];

        if (text) {
            const expression = /!(?<type>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;
            let match: RegExpExecArray | null;
            let marker: MarkerType | undefined;

            // TODO: replace to matchAll after v12 Active LTS Start (2019-10-22)
            // eslint-disable-next-line no-cond-assign
            while ((match = expression.exec(text)) !== null) {
                if (match.groups && match.groups.type) {
                    const { type, value } = match.groups;

                    marker = Key.getEqual(type, [...this.markers]) as MarkerType | undefined;

                    if (marker) markers.push([marker, type, value]);
                }
            }
        }

        return markers;
    }
}
