import { Task } from 'tasktree-cli/lib/task';
import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import Key from '../utils/key';
import Section, { Position } from '../entities/section';
import { ConfigurationOptions } from '../entities/configuration';
import { Option, OptionValue } from '../utils/types';
import { Status } from '../utils/enums';

enum Marker {
    // !break - indicates major changes breaking backward compatibility
    Breaking = 'break',
    // !deprecate- place a commit title to special section with deprecated properties
    Deprecated = 'deprecated',
    // !group(NAME) - creates a group of commits with the <NAME>
    Grouped = 'group',
    // !hide - hide a commit
    Hidden = 'hide',
    // !important - place a commit title to special section on top of changelog
    Important = 'important',
}

export interface Configuration extends ConfigurationOptions {
    markers: Option;
}

export default class MarkerPlugin extends Plugin {
    private static EXPRESSION = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;

    private markers: string[] = [];
    private sections: Map<string, Section> = new Map();

    public async init(config: Configuration): Promise<void> {
        const { markers } = config;

        this.sections = new Map();
        this.markers = [];

        if (typeof markers === 'object') {
            let position: Position | undefined;
            let title: Option | OptionValue;

            Key.unique(Object.values(Marker)).forEach((name): void => {
                title = markers[name];

                if (typeof title === 'string') {
                    switch (name) {
                        case Marker.Breaking:
                        case Marker.Deprecated:
                            position = Position.Header;
                            break;
                        case Marker.Important:
                            position = Position.Body;
                            break;
                        case Marker.Grouped:
                        case Marker.Hidden:
                        default:
                            position = Position.None;
                            break;
                    }

                    this.appendMarker(name, title, position);
                }
            });
        }
    }

    public async parse(commit: Commit, task: Task): Promise<void> {
        const expression = MarkerPlugin.EXPRESSION;
        let match: RegExpExecArray | null;
        let marker: string | undefined;
        let section: Section | undefined;

        commit.body.forEach((line): void => {
            do {
                match = expression.exec(line);

                if (match && match.groups && match.groups.name) {
                    const { name, value } = match.groups;

                    marker = Key.getEqual(name, this.markers);
                    section = marker ? this.sections.get(marker) : undefined;

                    switch (marker) {
                        case Marker.Breaking:
                            commit.setStatus(Status.BreakingChanges);
                            break;
                        case Marker.Deprecated:
                            commit.setStatus(Status.Deprecated);
                            break;
                        case Marker.Hidden:
                            commit.setStatus(Status.Hidden);
                            break;
                        case Marker.Important:
                            commit.setStatus(Status.Important);
                            break;
                        case Marker.Grouped:
                            section = this.context.addSection(value, Position.Group);
                            break;
                        default:
                            task.warn(`Marker ${name} is not available`);
                            break;
                    }

                    if (section) section.add(commit);
                }
            } while (match && expression.lastIndex);
        });
    }

    private appendMarker(name: string, title: string, position: Position): void {
        this.markers.push(name);

        if (position !== Position.None) {
            const section = this.context.addSection(title, position);

            if (section) {
                this.sections.set(name, section);
            }
        }
    }
}
