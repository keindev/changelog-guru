import { Message } from '../message';

describe('Message', (): void => {
    it('Spaces characters are ignored when creating', (): void => {
        const a = new Message('# Header\n some `markdown` text');
        const b = new Message('  ');

        expect(a.isEmpty()).toBeFalsy();
        expect(b.isEmpty()).toBeTruthy();
    });
});
