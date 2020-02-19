import * as Text from '../Text';

describe('Text', () => {
    it('Unify', () => {
        expect(Text.unify('')).toBe('');
        expect(Text.unify('   ')).toBe('');
        expect(Text.unify(' TEST ')).toBe('test');
    });

    it('inArray', () => {
        expect(Text.inArray('feat', ['fear', 'test'])).toBeTruthy();
        expect(Text.inArray('feat', ['feed', 'test'])).toBeFalsy();
        expect(Text.inArray('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('inMap', () => {
        const items: Map<string, string> = new Map();

        items.set('fear', 'feat');
        items.set('fig', 'fix');
        items.set('fast', 'slow');

        expect(Text.inMap('feat', items)).toBe('feat');
        expect(Text.inMap('fix', items)).toBe('fix');
        expect(Text.inMap('test', items)).toBeUndefined();
    });

    it('find', () => {
        const list = ['feat', 'fear', 'feed', 'fix'];

        expect(Text.find('feat', list)).toBe('feat');
        expect(Text.find('fear', list)).toBe('feat');
        expect(Text.find('fuel', list)).toBeUndefined();
    });

    it('isSame', () => {
        expect(Text.isSame('1234', '123x')).toBeTruthy();
        expect(Text.isSame('1234', '12xx')).toBeFalsy();
        expect(Text.isSame('1234567', '123456x')).toBeTruthy();
        expect(Text.isSame('1234567', '12345xx')).toBeFalsy();
    });
});
