import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import Key from '../utils/key';
import Section, { Position } from '../entities/section';
import { Options, Option, OptionValue } from '../io/config';

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

interface MarkerConfig extends Options {
    markers: Option;
}

export default class MarkerPlugin extends Plugin {
    private static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/i;

    private markers: Map<string, Section> = new Map();

    public async init(config: MarkerConfig) {
        const { markers } = config;

        if (typeof markers === 'object') {
            Object.values(MarkerName).forEach((name: string): void => {
                const title: Option | OptionValue = markers[name];

                if (typeof title === 'string') {
                    let position: Position | undefined;

                    if (name === MarkerName.Break || name === MarkerName.Deprecated) position = Position.Header;
                    if (name === MarkerName.Important) position = Position.Footer;

                    if (typeof position !== 'undefined') {
                        this.markers.set(name, this.state.createSection(title, position));
                    }
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const { state, markers } = this;
        let match: RegExpExecArray | null;
        let names: string[] = [...markers.keys(), MarkerName.Group];

        commit.body.forEach((line): void => {
            do {
                match = MarkerPlugin.EXPRESSION.exec(line);

                if (match && match.groups && typeof match.groups.name === 'string') {
                    const { name, value } = match.groups;
                    const key: string | undefined = Key.getEqualy(name, names);
                    let section: Section | undefined = key ? markers.get(key) : undefined;

                    switch (key) {
                        case MarkerName.Break: commit.break(); break;
                        case MarkerName.Deprecated: commit.deprecate(); break;
                        case MarkerName.Hide: commit.hide(); break;
                        case MarkerName.Important: commit.setImportant(); break;
                        case MarkerName.Group:
                            if (typeof value === 'string') section = state.createSection(value, Position.Group);
                            break;
                        // TODO: log message
                        default: Process.log(''); break;
                    }

                    if (section instanceof Section) section.assign(commit);
                }
            } while (match);
        });
    }
}
