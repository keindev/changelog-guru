import Entity, { ChangeLevel, Compare, Priority } from '../../core/entities/Entity';

describe('Entity', () => {
  const name = 'Entity';
  const entity: Entity = new Entity(name);

  describe('Static methods', () => {
    it('Comparison is correct', () => {
      const a = new Entity('A');
      const b = new Entity('B');

      b.level = ChangeLevel.Minor;

      expect(Entity.compare(a, b)).toBe(Compare.More);
      expect(Entity.compare(b, a)).toBe(Compare.Less);
      expect(Entity.compare(a, a)).toBe(Compare.Equal);
    });

    it('Entities is filtered', () => {
      const a = new Entity('A');
      const b = new Entity('B');

      b.isIgnored = true;

      expect(Entity.filter(a)).toBeTruthy();
      expect(Entity.filter(b)).toBeFalsy();
    });
  });

  describe('Change entity', () => {
    it('Default options are set correctly', () => {
      expect(entity.name).toBe(name);
      expect(entity.level).toBe(ChangeLevel.Patch);
      expect(entity.priority).toBe(Priority.Low);
      expect(entity.isIgnored).toBeFalsy();
      expect(entity.isEmpty).toBeFalsy();
    });

    it('Level will change', () => {
      entity.level = ChangeLevel.Patch;
      expect(entity.level).toBe(ChangeLevel.Patch);
      expect(entity.priority).toBe(Priority.Low);

      entity.level = ChangeLevel.Minor;
      expect(entity.level).toBe(ChangeLevel.Minor);
      expect(entity.priority).toBe(Priority.Medium);

      entity.level = ChangeLevel.Major;
      expect(entity.level).toBe(ChangeLevel.Major);
      expect(entity.priority).toBe(Priority.High);

      entity.level = ChangeLevel.Minor;
      expect(entity.level).toBe(ChangeLevel.Minor);
      expect(entity.priority).toBe(Priority.Medium);

      entity.level = ChangeLevel.Patch;
      expect(entity.level).toBe(ChangeLevel.Patch);
      expect(entity.priority).toBe(Priority.Low);
    });

    it('Entity ignored', () => {
      entity.isIgnored = true;

      expect(entity.isIgnored).toBeTruthy();
      expect(entity.isEmpty).toBeTruthy();
    });
  });
});
