import { Context } from '../../src/entities/state';
import Section, { Position } from '../../src/entities/section';

export class TestContext implements Context {
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public findSection(title: string): Section | undefined {
        return new Section(title, Position.Header);
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public addSection(title: string, position: Position): Section {
        return new Section(title, position);
    }
}
