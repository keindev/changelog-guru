import { Task } from 'tasktree-cli/lib/task';
import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import Key from '../utils/key';
import Section, { Position } from '../entities/section';
import { ConfigOptions } from '../entities/config';
import { Option, OptionValue } from '../utils/types';
import { Status } from '../utils/enums';

enum Marker {
    // !break - indicates major changes breaking backward compatibility
    Breaking = 'break',
    // !deprecate- place a commit title to special section with deprecated propertyes
    Deprecated = 'deprecated',
    // !group(NAME) - creates a group of commits with the <NAME>
    Grouped = 'group',
    // !hide - hide a commit
    Hidden = 'hide',
    // !important - place a commit title to special section on top of changelog
    Important = 'important',
}

export interface Config extends ConfigOptions {
    markers: Option;
}

export default class MarkerPlugin extends Plugin {
    private static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;

    private markers: Map<string, Section> = new Map();

    public async init(config: Config): Promise<void> {
        const { markers } = config;

        if (typeof markers === 'object') {
            Object.values(Marker).forEach((name: string): void => {
                const title: Option | OptionValue = markers[name];

                if (typeof title === 'string') {
                    let position: Position | undefined;

                    if (name === Marker.Breaking || name === Marker.Deprecated) position = Position.Header;
                    if (name === Marker.Important) position = Position.Body;

                    if (typeof position !== 'undefined') {
                        this.markers.set(name, this.context.addSection(title, position));
                    }
                }
            });
        }
    }

    public async parse(commit: Commit, task: Task): Promise<void> {
        const { markers } = this;
        const names: string[] = [...markers.keys(), Marker.Hidden, Marker.Grouped];
        const getGroup = (name: string): Section => this.context.addSection(name, Position.Group);
        const expression = MarkerPlugin.EXPRESSION;
        let match: RegExpExecArray | null;

        commit.body.forEach((line): void => {
            do {
                match = expression.exec(line);

                if (match && match.groups && typeof match.groups.name === 'string') {
                    const { name, value } = match.groups;
                    const key: string | undefined = Key.getEqualy(name, names);
                    let section: Section | undefined = key ? markers.get(key) : undefined;

                    switch (key) {
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
                            if (typeof value === 'string') section = getGroup(value);
                            break;
                        default:
                            task.warn(`Marker ${name} is not available`);
                            break;
                    }

                    if (section instanceof Section) section.assign(commit);
                }
            } while (match && expression.lastIndex);
        });
    }
}
