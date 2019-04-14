import Key from '../../utils/key';
import Entity from '../../entities/entity';
import Section, { SectionPosition } from '../../entities/section';

export default class SectionManager extends Entity {
    private sections: Section[] = [];
    private relations: Map<number, Set<string>> = new Map();

    public create(title: string, position: SectionPosition = SectionPosition.Subgroup): number {
        const { sections } = this;
        const key = Key.unify(title);
        let index: number = sections.findIndex((section) => Key.isEqual(section.key, key));

        if (!~index) {
            index = sections.push(new Section(title, position)) - 1;
        }

        return index;
    }

    public assign(index: number, sha: string) {
        const { relations } = this;
        let relation: Set<string> | undefined = relations.get(index);

        if (typeof relation === 'undefined') {
            relation = new Set();
        }

        relation.add(sha);
    }


}
