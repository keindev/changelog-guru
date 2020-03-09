import { Task } from 'tasktree-cli/lib/task';
import Section, { Position, Order } from '../../core/entities/Section';
import Commit, { Status } from '../../core/entities/Commit';
import { findSame } from '../../utils/Text';
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

const positions: { [key: string]: Position | undefined } = {
    [MarkerType.Breaking]: Position.Header,
    [MarkerType.Deprecated]: Position.Header,
    [MarkerType.Important]: Position.Body,
};

const statuses: { [key: string]: Status | undefined } = {
    [MarkerType.Breaking]: Status.BreakingChanges,
    [MarkerType.Deprecated]: Status.Deprecated,
    [MarkerType.Important]: Status.Important,
};

export default class MarkersManager extends Plugin {
    private markers: Set<MarkerType> = new Set();
    private sections: Map<MarkerType, Section> = new Map();

    constructor(config: IPluginConfig, context?: IPluginContext) {
        const { actions, joins } = config as {
            actions: (MarkerType.Ignore | MarkerType.Grouped)[];
            joins: { [key in MarkerType.Breaking | MarkerType.Deprecated | MarkerType.Important]: string };
        };

        this.markers = new Set(actions.filter(action => action === MarkerType.Ignore || action === MarkerType.Grouped));

        if (this.context) {
            this.sections = new Map(
                Object.entries(joins).reduce((acc: [MarkerType, Section][], [type, title]) => {
                    const position = positions[type] ?? Position.None;
                    const section = this.context!.addSection(title, position, Order.Min);

                    if (section) {
                        this.markers.add(type as MarkerType);
                        acc.push([type as MarkerType, section]);
                    }

                    return acc;
                }, [])
            );
        }
    }

    async parse(commit: Commit): Promise<void> {
        const { context } = this;
        const markers = this.getMarkersFrom(commit.body[0]);
        let section: Section | undefined;

        if (markers.find(([marker]) => marker === MarkerType.Ignore)) {
            commit.ignore();
        } else {
            markers.forEach(([marker, value]) => {
                if (statuses[marker]) commit.status = statuses[marker]!;
                if (marker === MarkerType.Grouped && value && context) section = context.addSection(value);
                if ((section = section || this.sections.get(marker))) section.add(commit);
            });
        }
    }

    lint(options: IPluginLintOptions, task: Task): void {
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
        const markers: [MarkerType, string, string][] = [];

        if (text) {
            const expression = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;
            let match: RegExpExecArray | null;
            let marker: MarkerType | undefined;

            // eslint-disable-next-line no-cond-assign
            while ((match = expression.exec(text)) !== null) {
                if (match.groups && match.groups.type) {
                    const { name, value } = match.groups;

                    if ((marker = findSame(name, [...this.markers]) as MarkerType | undefined))
                        markers.push([marker, value, name]);
                }
            }
        }

        return markers;
    }
}
