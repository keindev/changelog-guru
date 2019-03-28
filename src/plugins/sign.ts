import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Modifier from '../entities/modifier';

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

export class SignModifier implements Modifier {
    public type: SignType;
    public name: string;
    public value: string;

    constructor(type: SignType, name: string, value: string) {
        this.type = type;
        this.name = name;
        this.value = value;
    }
}

// [<signs>] - list of commit signs: !break !group(New awesome feature)
export default class Sign extends AbstractPlugin {
    static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w ]+)\)|)( |)/gi;

    private types: SignType = SignType.None;

    constructor(config: SignConfig) {
        super(config);

        if (Array.isArray(config.signs)) {
            config.signs.forEach((name: SignName) => {
                this.types = this.types | this.getType(name);
            });
        }
    }

    public parse(commit: Commit): void {
        let match: RegExpExecArray | null;
        let type: SignType;

        commit.body.forEach((line) => {
            while (match = Sign.EXPRESSION.exec(line)) {
                if (match.groups) {
                    const { name, value } = match.groups;

                    type = this.getType(name);

                    if (this.types & type) {
                        commit.modifiers.push(new SignModifier(type, name, value));
                    }
                }
            }
        });
    }

    public async modify(state: State, commit: Commit): Promise<void> {
        commit.modifiers.forEach((modifier: Modifier) => {
            if (modifier instanceof SignModifier) {
                // TODO: Modificate
            }
        });
    }

    private getType(name: string): SignType {
        let result: SignType;

        switch(name) {
            case SignName.Break: result = SignType.Break; break;
            case SignName.Deprecated: result = SignType.Deprecated; break;
            case SignName.Group: result = SignType.Group; break;
            case SignName.Hide: result = SignType.Hide; break;
            case SignName.Important: result = SignType.Important; break;
            default: result = SignType.None; break;
        }

        return result;
    }
}
