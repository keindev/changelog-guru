import Key from '../Key';

describe('Key', () => {
    it('Unify', () => {
        expect(Key.unify('')).toBe('');
        expect(Key.unify('   ')).toBe('');
        expect(Key.unify(' TEST ')).toBe('test');
    });

    it('inArray', () => {
        expect(Key.inArray('feat', ['fear', 'test'])).toBeTruthy();
        expect(Key.inArray('feat', ['feed', 'test'])).toBeFalsy();
        expect(Key.inArray('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('inSet', () => {
        const items: Set<string> = new Set();

        items.add('fear');
        items.add('fig');
        items.add('fast');

        expect(Key.inSet('feat', items)).toBeTruthy();
        expect(Key.inSet('fix', items)).toBeTruthy();
        expect(Key.inSet('test', items)).toBeFalsy();
    });

    it('inMap', () => {
        const items: Map<string, string> = new Map();

        items.set('fear', 'feat');
        items.set('fig', 'fix');
        items.set('fast', 'slow');

        expect(Key.inMap('feat', items)).toBe('feat');
        expect(Key.inMap('fix', items)).toBe('fix');
        expect(Key.inMap('test', items)).toBeUndefined();
    });

    it('getEqual', () => {
        const list = ['feat', 'fear', 'feed', 'fix'];

        expect(Key.getEqual('feat', list)).toBe('feat');
        expect(Key.getEqual('fear', list)).toBe('feat');
        expect(Key.getEqual('fuel', list)).toBeUndefined();
    });

    it('isEqual', () => {
        expect(Key.isEqual('1234', '123x')).toBeTruthy();
        expect(Key.isEqual('1234', '12xx')).toBeFalsy();
        expect(Key.isEqual('1234567', '123456x')).toBeTruthy();
        expect(Key.isEqual('1234567', '12345xx')).toBeFalsy();
    });
});
