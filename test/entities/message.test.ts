import { Message } from '../../src/entities/message';
import { Entity } from '../../src/entities/entity';

describe('Message', (): void => {
    it('Default', (): void => {
        const a = new Message('# Markdown text');
        const b = new Message('  ');

        expect(a instanceof Entity).toBeTruthy();
        expect(a.isEmpty()).toBeFalsy();
        expect(b.isEmpty()).toBeTruthy();
    });
});
