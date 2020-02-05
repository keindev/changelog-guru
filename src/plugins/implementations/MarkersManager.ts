import { Task } from 'tasktree-cli/lib/task';
import Section, { SectionPosition, SectionOrder } from '../../core/entities/Section';
import Commit, { CommitStatus } from '../../core/entities/Commit';
import Key from '../../utils/Key';
import Plugin, { IPluginLintOptions, IPluginConfig } from '../Plugin';

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

const positions: { [key: string]: SectionPosition | undefined } = {
    [MarkerType.Breaking]: SectionPosition.Header,
    [MarkerType.Deprecated]: SectionPosition.Header,
    [MarkerType.Important]: SectionPosition.Body,
};

const statuses: { [key: string]: CommitStatus | undefined } = {
    [MarkerType.Breaking]: CommitStatus.BreakingChanges,
    [MarkerType.Deprecated]: CommitStatus.Deprecated,
    [MarkerType.Important]: CommitStatus.Important,
};

export default class MarkersManager extends Plugin {
    private markers: Set<MarkerType> = new Set();
    private sections: Map<MarkerType, Section> = new Map();

    public async init(config: IPluginConfig): Promise<void> {
        const { actions, joins } = config as {
            actions: (MarkerType.Ignore | MarkerType.Grouped)[];
            joins: { [key in MarkerType.Breaking | MarkerType.Deprecated | MarkerType.Important]: string };
        };

        this.markers = new Set(actions.filter(action => action === MarkerType.Ignore || action === MarkerType.Grouped));

        if (this.context) {
            this.sections = new Map(
                Object.entries(joins).reduce((acc: [MarkerType, Section][], [type, title]) => {
                    const position = positions[type] ?? SectionPosition.None;
                    const section = this.context!.addSection(title, position, SectionOrder.Min);

                    if (section) {
                        this.markers.add(type as MarkerType);
                        acc.push([type as MarkerType, section]);
                    }

                    return acc;
                }, [])
            );
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const { context } = this;
        const markers = this.getMarkersFrom(commit.body[0]);
        let section: Section | undefined;

        if (markers.find(([marker]) => marker === MarkerType.Ignore)) {
            commit.ignore();
        } else {
            markers.forEach(([marker, value]) => {
                if (statuses[marker]) commit.setStatus(statuses[marker]!);
                if (marker === MarkerType.Grouped && value && context) section = context.addSection(value);

                section = section || this.sections.get(marker);

                if (section) section.add(commit);
            });
        }
    }

    public lint(options: IPluginLintOptions, task: Task): void {
        const { body } = options;
        const markersLine = body[0];
        const blackLine = body[1];
        const bodyFirstLine = body[2];
        const markers = this.getMarkersFrom(markersLine);
        const names: string[] = Object.values(MarkerType);

        if (markers.length) {
            task.log(`Markers: ${markersLine}`);

            markers.forEach(([marker, value, type]) => {
                if (!names.some(name => name === marker)) task.error(`Unexpected marker {bold !${type}}`);
                if (marker === MarkerType.Grouped && !value) task.error(`{bold !group} name is empty`);
            });

            if (bodyFirstLine && blackLine.trim().length) task.error('Missing blank line between markers and body');
        } else if (markersLine && markersLine.length) {
            task.error('Missing blank line between header and body');
        }
    }

    private getMarkersFrom(text?: string): [MarkerType, string, string][] {
        const markers: [MarkerType, string][] = [];

        if (text) {
            const expression = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;
            let match: RegExpExecArray | null;
            let marker: MarkerType | undefined;

            // eslint-disable-next-line no-cond-assign
            while ((match = expression.exec(text)) !== null) {
                if (match.groups && match.groups.type) {
                    const { name, value } = match.groups;

                    marker = Key.getEqual(name, [...this.markers]) as MarkerType | undefined;

                    if (marker) markers.push([marker, value, name]);
                }
            }
        }

        return markers;
    }
}
