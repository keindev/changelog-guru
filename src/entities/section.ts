import Entity from './entity';
import Key from '../utils/key';

export enum SectionPosition {
    Header = 1,
    Body = 2,
    Footer = 3,
    Group = 4,
    Subgroup = 5,
}

export default class Section extends Entity {
    public readonly key: string;
    public readonly title: string;
    public readonly position: SectionPosition;

    public constructor(title: string, position?: SectionPosition) {
        super(title);

        this.key = Key.unify(title);
        this.title = title;
        this.position = position || SectionPosition.Subgroup;
    }
}
