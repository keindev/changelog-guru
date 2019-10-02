import { Message } from '../message';

describe('Message', () => {
    it('Spaces characters are ignored when creating', () => {
        const a = new Message('# Header\n some `markdown` text');
        const b = new Message('  ');

        expect(a.isEmpty()).toBeFalsy();
        expect(b.isEmpty()).toBeTruthy();
    });
});
