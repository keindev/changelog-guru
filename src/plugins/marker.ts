import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';
import Section, { SectionPosition } from '../entities/section';

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
    markers: { [key: string]: string } | undefined;
}

export default class MarkerPlugin extends AbstractPlugin {
    private static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w ]+)\)|)( |)/gi;
    private sections: Map<string, number> = new Map();

    public constructor(config: MarkerConfig, state: State) {
        super(config, state);

        const { markers } = config;

        if (markers) {
            Object.keys(MarkerName).forEach((name: string) => {
                if (typeof markers[name] === 'string') {
                    let position: SectionPosition;

                    switch(name) {
                        case MarkerName.Break:
                        case MarkerName.Deprecated: position = SectionPosition.Header; break;
                        case MarkerName.Important: position = SectionPosition.Footer; break;
                        case MarkerName.Hide:
                        default: position = SectionPosition.Mixed; break;
                    }

                    this.sections.set(name, state.sections.create(markers[name], position));
                }
            });
        }
    }

    public parse(commit: Commit): void {
        let match: RegExpExecArray | null;

        commit.body.forEach((line): void => {
            do {
                match = MarkerPlugin.EXPRESSION.exec(line);

                if (match && match.groups) {
                    const { name, value } = match.groups;

                    if (typeof name === 'string') {
                        const { state, sections } = this;
                        const marker: string = name.toLowerCase();
                        const index: number | undefined = marker === MarkerName.Group && typeof value === 'string'
                            ? state.sections.create(value, SectionPosition.Group)
                            : sections.get(marker);

                        if (typeof index === 'number') {
                            state.sections.assign(index, commit.sha);
                        }
                    }
                }
            } while (match);
        });
    }
}
