import Key from '../../src/utils/key';

// eslint-disable-next-line max-lines-per-function
describe('Key', (): void => {
    it('Unify', (): void => {
        expect(Key.unify('')).toBe('');
        expect(Key.unify('   ')).toBe('');
        expect(Key.unify(' TEST ')).toBe('test');
    });

    it('inArray', (): void => {
        expect(Key.inArray('feat', ['fear', 'test'])).toBeTruthy();
        expect(Key.inArray('feat', ['feed', 'test'])).toBeFalsy();
        expect(Key.inArray('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('inSet', (): void => {
        const items: Set<string> = new Set();

        items.add('fear');
        items.add('fig');
        items.add('fast');

        expect(Key.inSet('feat', items)).toBeTruthy();
        expect(Key.inSet('fix', items)).toBeTruthy();
        expect(Key.inSet('test', items)).toBeFalsy();
    });

    it('inMap', (): void => {
        const items: Map<string, string> = new Map();

        items.set('fear', 'feat');
        items.set('fig', 'fix');
        items.set('fast', 'slow');

        expect(Key.inMap('feat', items)).toBe('feat');
        expect(Key.inMap('fix', items)).toBe('fix');
        expect(Key.inMap('test', items)).toBeUndefined();
    });

    it('getEqual', (): void => {
        const list = ['feat', 'fear', 'feed', 'fix'];

        expect(Key.getEqual('feat', list)).toBe('feat');
        expect(Key.getEqual('fear', list)).toBe('feat');
        expect(Key.getEqual('fuel', list)).toBeUndefined();
    });

    it('isEqual', (): void => {
        expect(Key.isEqual('1234', '123x')).toBeTruthy();
        expect(Key.isEqual('1234', '12xx')).toBeFalsy();
        expect(Key.isEqual('1234567', '123456x')).toBeTruthy();
        expect(Key.isEqual('1234567', '12345xx')).toBeFalsy();
    });
});
