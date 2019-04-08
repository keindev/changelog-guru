import Config from '../io/config';
import Commit from './commit';
import State from '../middleware/state';
import Entity from './entity';
import Section, { SectionBlock, SectionPosition } from './section';

export interface Plugin {
    parse(commit: Commit): void;
    modify(commit: Commit): Promise<void>;
    modify(commit: Commit, modifier: Entity): Promise<void>;
}

export default abstract class AbstractPlugin extends Entity implements Plugin {
    protected config: Config;
    protected state: State;
    private modifier: string | undefined;

    public constructor(config: Config, state: State) {
        super();

        this.config = config;
        this.state = state;
    }

    public abstract parse(commit: Commit): void;
    public abstract modify(commit: Commit): Promise<void>;
    public abstract modify(commit: Commit, modifier: Entity): Promise<void>;

    public addModifier(commit: Commit, modifier: Entity): void {
        commit.modifiers.push(modifier);

        if (typeof this.modifier === 'undefined') {
            this.modifier = modifier.constructor.name;
        }
    }

    public isCompatible(modifier: Entity): boolean {
        return this.modifier === modifier.constructor.name;
    }

    public addToSection(title: string, commit: Commit, position: SectionPosition | number = SectionPosition.Any,
        block: SectionBlock = SectionBlock.Mixed): void {
        const { state } = this;
        let section: Section | undefined = state.getSection(title);

        if (!section) {
            section = new Section(title, block, position);
            state.addSection(section);
        }

        section.assign(commit);
    }
}
