import { Context } from '../../src/entities/state';
import Section, { Position } from '../../src/entities/section';

export class TestContext implements Context {
    public readonly sections: Map<string, Section> = new Map();

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public findSection(title: string): Section | undefined {
        return this.sections.get(title);
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public addSection(title: string, position: Position): Section {
        const section = new Section(title, Position.Header);

        this.sections.set(title, section);

        return section;
    }
}
