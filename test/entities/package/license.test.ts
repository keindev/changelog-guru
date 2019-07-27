import { License } from '../../../src/entities/package/license';

describe('License', (): void => {
    it('Default', (): void => {
        const license = new License('MIT', '(ISC OR GPL-3.0)');

        expect(license.id).toBe('MIT');
        expect(license.prev).toBe('(ISC OR GPL-3.0)');
        expect(license.isChanged).toBeTruthy();
    });
});
