import * as Text from '../Text';

describe('Text', () => {
    it('Unify', () => {
        expect(Text.unify('')).toBe('');
        expect(Text.unify('   ')).toBe('');
        expect(Text.unify(' TEST ')).toBe('test');
    });

    it('findSame', () => {
        expect(Text.findSame('feat', ['fear', 'test'])).toBeTruthy();
        expect(Text.findSame('feat', ['feed', 'test'])).toBeFalsy();
        expect(Text.findSame('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('isSame', () => {
        expect(Text.isSame('1234', '123x')).toBeTruthy();
        expect(Text.isSame('1234', '12xx')).toBeFalsy();
        expect(Text.isSame('1234567', '123456x')).toBeTruthy();
        expect(Text.isSame('1234567', '12345xx')).toBeFalsy();
    });
});
