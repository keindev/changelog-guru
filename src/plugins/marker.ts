import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config, { ConfigOption, ConfigOptionValue } from '../io/config';
import Key from '../utils/key';
import { SectionPosition } from '../entities/section';

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

interface MarkerConfig extends Config {
    markers: ConfigOption;
}

export default class MarkerPlugin extends AbstractPlugin {
    private static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w ]+)\)|)( |)/gi;

    public constructor(config: MarkerConfig, state: State) {
        super(config, state);

        const { markers } = config;

        if (markers) {
            Object.keys(MarkerName).forEach((name: string): void => {
                const title: ConfigOption | ConfigOptionValue = markers[name];

                if (typeof title === 'string') {
                    let position: SectionPosition | undefined;

                    if (name === MarkerName.Break || name === MarkerName.Deprecated) position = SectionPosition.Header;
                    if (name === MarkerName.Important) position = SectionPosition.Footer;

                    if (typeof position !== 'undefined') {
                        this.createSection(name, position, title);
                    }
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        let match: RegExpExecArray | null;

        commit.body.forEach((line): void => {
            do {
                match = MarkerPlugin.EXPRESSION.exec(line);

                if (match && match.groups && typeof match.groups.name === 'string') {
                    const { name, value } = match.groups;

                    if (typeof value === 'string' && Key.isEqual(Key.unify(name), MarkerName.Group)) {
                        this.createSection(value, SectionPosition.Group);
                    }

                    this.assignSection(name, commit);
                }
            } while (match);
        });
    }
}
