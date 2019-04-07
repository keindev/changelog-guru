import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';

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

class SignModifier extends Entity {
    public readonly type: SignType;
    public readonly value: string;

    public constructor(type: SignType, value: string) {
        super();

        this.type = type;
        this.value = value;
    }
}

export default class Sign extends AbstractPlugin {
    public static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w ]+)\)|)( |)/gi;

    private types: SignType = SignType.None;

    public static getType(name: string): SignType {
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

    public constructor(config: SignConfig) {
        super(config);

        if (Array.isArray(config.signs)) {
            config.signs.forEach((name: SignName): void => {
                this.debug('avaliable: %s', name);
                this.types = this.types | Sign.getType(name);
            });
        }
    }

    public parse(commit: Commit): void {
        let match: RegExpExecArray | null;
        let type: SignType;

        commit.body.forEach((line): void => {
            do {
                match = Sign.EXPRESSION.exec(line);

                if (match && match.groups) {
                    const { name, value } = match.groups;

                    type = Sign.getType(name);

                    if (this.types & type) {
                        this.addModifier(commit, new SignModifier(type, value));
                    }
                }
            } while (match);
        });
    }

    public async modify(state: State, commit: Commit, modifier?: Entity): Promise<void> {
        if (this.types !== SignType.None) {
            const { value, type } = modifier as SignModifier;

            if (type & SignType.Break) commit.break();
            if (type & SignType.Deprecated) commit.deprecate();
            if (type & SignType.Hide) commit.hide();
            if (type & SignType.Important) commit.increasePriority();
            if (type & SignType.Group) state.group(value, commit);
        }
    }
}
