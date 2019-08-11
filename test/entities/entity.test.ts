import { Entity } from '../../src/entities/entity';
import { Priority, Compare } from '../../src/typings/enums';
import { ChangeLevel } from '../../src/config/config';

describe('Entity', (): void => {
    let $entity: Entity;

    beforeAll((): void => {
        $entity = new Entity('test0123456789');
    });

    describe('Static', (): void => {
        it('Compare', (): void => {
            const a = new Entity('A');
            const b = new Entity('B');

            b.setChangeLevel(ChangeLevel.Minor);

            expect(Entity.compare(a, b)).toBe(Compare.More);
            expect(Entity.compare(b, a)).toBe(Compare.Less);
            expect(Entity.compare(a, a)).toBe(Compare.Equal);
        });

        it('Filter', (): void => {
            const a = new Entity('A');
            const b = new Entity('B');

            b.ignore();

            expect(Entity.filter(a)).toBeTruthy();
            expect(Entity.filter(b)).toBeFalsy();
        });
    });

    it('Default', (): void => {
        expect($entity.getName()).toBe('test0123456789');
        expect($entity.getShortName()).toBe('test012');
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($entity.getPriority()).toBe(Priority.Low);
        expect($entity.isIgnored()).toBeFalsy();
        expect($entity.isEscaped()).toBeFalsy();
        expect($entity.isEmpty()).toBeFalsy();
    });

    it('Change level', (): void => {
        $entity.setChangeLevel(ChangeLevel.Patch);
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($entity.getPriority()).toBe(Priority.Low);

        $entity.setChangeLevel(ChangeLevel.Minor);
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Minor);
        expect($entity.getPriority()).toBe(Priority.Medium);

        $entity.setChangeLevel(ChangeLevel.Major);
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Major);
        expect($entity.getPriority()).toBe(Priority.High);

        $entity.setChangeLevel(ChangeLevel.Minor);
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Minor);
        expect($entity.getPriority()).toBe(Priority.Medium);

        $entity.setChangeLevel(ChangeLevel.Patch);
        expect($entity.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($entity.getPriority()).toBe(Priority.Low);
    });

    it('Ignore', (): void => {
        $entity.ignore();

        expect($entity.isIgnored()).toBeTruthy();
        expect($entity.isEmpty()).toBeTruthy();
    });

    it('Escape', (): void => {
        $entity.escape();

        expect($entity.isEscaped()).toBeTruthy();
    });
});
