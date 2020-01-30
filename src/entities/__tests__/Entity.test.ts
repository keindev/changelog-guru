import faker from 'faker';
import Entity, { Compare, Priority } from '../Entity';
import { ChangeLevel } from '../../config/Config';

const name = faker.internet.userName(faker.name.firstName(), faker.name.lastName());
const entity: Entity = new Entity(name);

describe('Entity', () => {
    describe('Static methods', () => {
        it('Comparison is correct', () => {
            const a = new Entity('A');
            const b = new Entity('B');

            b.setChangeLevel(ChangeLevel.Minor);

            expect(Entity.compare(a, b)).toBe(Compare.More);
            expect(Entity.compare(b, a)).toBe(Compare.Less);
            expect(Entity.compare(a, a)).toBe(Compare.Equal);
        });

        it('Entities is filtered', () => {
            const a = new Entity(faker.name.firstName());
            const b = new Entity(faker.name.firstName());

            b.ignore();

            expect(Entity.filter(a)).toBeTruthy();
            expect(Entity.filter(b)).toBeFalsy();
        });
    });

    describe('Change entity', () => {
        it('Default options are set correctly', () => {
            expect(entity.getName()).toBe(name);
            expect(entity.getShortName()).toBe(name.substr(0, 7));
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Patch);
            expect(entity.getPriority()).toBe(Priority.Low);
            expect(entity.isIgnored()).toBeFalsy();
            expect(entity.isEmpty()).toBeFalsy();
        });

        it('Level will change', () => {
            entity.setChangeLevel(ChangeLevel.Patch);
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Patch);
            expect(entity.getPriority()).toBe(Priority.Low);

            entity.setChangeLevel(ChangeLevel.Minor);
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Minor);
            expect(entity.getPriority()).toBe(Priority.Medium);

            entity.setChangeLevel(ChangeLevel.Major);
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Major);
            expect(entity.getPriority()).toBe(Priority.High);

            entity.setChangeLevel(ChangeLevel.Minor);
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Minor);
            expect(entity.getPriority()).toBe(Priority.Medium);

            entity.setChangeLevel(ChangeLevel.Patch);
            expect(entity.getChangeLevel()).toBe(ChangeLevel.Patch);
            expect(entity.getPriority()).toBe(Priority.Low);
        });

        it('Entity ignored', () => {
            entity.ignore();

            expect(entity.isIgnored()).toBeTruthy();
            expect(entity.isEmpty()).toBeTruthy();
        });
    });
});
