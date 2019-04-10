import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';
import Section, { SectionPosition } from '../entities/section';

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

export default class SignPlugin extends AbstractPlugin {
    public static EXPRESSION: RegExp = /!(?<name>[a-z]+)(\((?<value>[\w ]+)\)|)( |)/gi;
    public static IMPORTANT_SECTION_TITLE: string = "Important";

    private types: SignType = SignType.None;
    private section: Section;

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

    public constructor(config: SignConfig, state: State) {
        super(config, state);

        if (Array.isArray(config.signs)) {
            config.signs.forEach((name: SignName): void => {
                this.debug('avaliable: %s', name);
                this.types = this.types | SignPlugin.getType(name);
            });
        }

        this.section = state.sections.add(SignPlugin.IMPORTANT_SECTION_TITLE, SectionPosition.Top) as Section;
    }

    public parse(commit: Commit): void {
        let match: RegExpExecArray | null;
        let type: SignType;

        commit.body.forEach((line): void => {
            do {
                match = SignPlugin.EXPRESSION.exec(line);

                if (match && match.groups) {
                    const { name, value } = match.groups;

                    type = SignPlugin.getType(name);

                    if (this.types & type) {
                        this.addModifier(commit, new SignModifier(type, value));
                    }
                }
            } while (match);
        });
    }

    public async modify(commit: Commit, modifier?: Entity): Promise<void> {
        if (this.types !== SignType.None) {
            const { value, type } = modifier as SignModifier;
            const { state: { sections } } = this;

            if (type & SignType.Break) commit.break();
            if (type & SignType.Deprecated) commit.deprecate();
            if (type & SignType.Hide) commit.hide();
            if (type & SignType.Important) sections.assign(this.section, commit);
            if (type & SignType.Group && typeof value === 'string') {
                const section: Section | undefined = sections.add(value);

                if (section) sections.assign(section, commit);
            }
        }
    }
}
