import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';

enum SignName {
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

enum SignType {
    None = 0,
    Break = 1,
    Deprecated = 2,
    Group = 4,
    Hide = 8,
    Important = 16,
}

interface SignConfig extends Config {
    signs: SignName[] | undefined;
}

// [<signs>] - list of commit signs: !break !group(New awesome feature)
export default class Sign extends AbstractPlugin {
    static REPLACER: string = '';
    static BRACKET_LEFT: string = '(';
    static BRACKET_RIGHT: string = ')';
    static EXPRESSION: RegExp = /![a-z]+(\([\w ]+\)|)( |)/gi;

    private avaliable: SignType = SignType.None;

    constructor(config: SignConfig) {
        super(config);

        if (Array.isArray(config.signs)) {
            const append = (type: SignType) => {
                this.avaliable = this.avaliable | type;
            };

            config.signs.forEach((sign: SignName) => {
                switch(sign) {
                    case SignName.Break: append(SignType.Break); break;
                    case SignName.Deprecated: append(SignType.Deprecated); break;
                    case SignName.Group: append(SignType.Group); break;
                    case SignName.Hide: append(SignType.Hide); break;
                    case SignName.Important: append(SignType.Important); break;
                }
            });
        }
    }

    public parse(state: State, commit: Commit): void {
        commit.body.forEach((line) => {
            line.replace(Sign.EXPRESSION, (match: string) => {
                let name: string = match.trim().slice(1);
                let argument: string;

                if (name[name.length - 1] === Sign.BRACKET_RIGHT) {
                    let split: [string, string] = name.slice(0, -1).split(Sign.BRACKET_LEFT) as [string, string];

                    name = split[0];
                    argument = split[1];
                }

                // TODO: check name & if is avaliable add to "section"

                return Sign.REPLACER;
            });
        });
    }

    public async modify(): Promise<void> {

    }
}
