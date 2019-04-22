import chalk from 'chalk';
import Process from '../utils/process';
import Commit, { Status } from '../entities/commit';
import Plugin from '../entities/plugin';
import Key from '../utils/key';
import Section, { Position } from '../entities/section';
import { ConfigOptions } from '../entities/config';
import { Option, OptionValue } from '../utils/types';

enum MarkerName {
    // !break - indicates major changes breaking backward compatibility
    Break = 'break',
    // !deprecated- place a commit title to special section with deprecated propertyes
    Deprecated = 'deprecated',
    // !group(NAME) - creates a group of commits with the <NAME>
    Group = 'group',
    // !hide - hide a commit
    Hide = 'hide',
    // !important - place a commit title to special section on top of changelog
    Important = 'important',
}

interface Config extends ConfigOptions {
    markers: Option;
}

export default class MarkerPlugin extends Plugin {
    private static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/i;

    private markers: Map<string, Section> = new Map();

    public async init(config: Config): Promise<void> {
        const { markers } = config;

        if (typeof markers === 'object') {
            Object.values(MarkerName).forEach((name: string): void => {
                const title: Option | OptionValue = markers[name];

                if (typeof title === 'string') {
                    let position: Position | undefined;

                    if (name === MarkerName.Break || name === MarkerName.Deprecated) position = Position.Header;
                    if (name === MarkerName.Important) position = Position.Footer;

                    if (typeof position !== 'undefined') {
                        this.markers.set(name, this.context.addSection(title, position));
                    }
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const { markers } = this;
        const names: string[] = [...markers.keys(), MarkerName.Group];
        const getGroup = (name: string): Section => this.context.addSection(name, Position.Group);
        let match: RegExpExecArray | null;

        commit.body.forEach((line): void => {
            do {
                match = MarkerPlugin.EXPRESSION.exec(line);

                if (match && match.groups && typeof match.groups.name === 'string') {
                    const { name, value } = match.groups;
                    const key: string | undefined = Key.getEqualy(name, names);
                    let section: Section | undefined = key ? markers.get(key) : undefined;

                    switch (key) {
                    case MarkerName.Break: commit.setStatus(Status.BreakingChanges); break;
                    case MarkerName.Deprecated: commit.setStatus(Status.Deprecated); break;
                    case MarkerName.Hide: commit.setStatus(Status.Hidden); break;
                    case MarkerName.Important: commit.setStatus(Status.Important); break;
                    case MarkerName.Group: if (typeof value === 'string') section = getGroup(value); break;
                    default: Process.warn(chalk`Marker {bold ${name}} is not avaliable`); break;
                    }

                    if (section instanceof Section) section.assign(commit);
                }
            } while (match);
        });
    }
}
