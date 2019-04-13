import Entity from './entity';

export enum SectionPosition {
    Group,
    Subgroup,
    Header,
    Body,
    Footer,
}

export default class Section extends Entity {
    public readonly title: string;
    public readonly trimmedTitle: string;
    public readonly position: SectionPosition;

    public static trim(title: string): string {
        return title.trim().toLowerCase();
    }

    public constructor(title: string, position?: SectionPosition) {
        super(title);

        this.title = title;
        this.trimmedTitle = Section.trim(title);
        this.position = position || SectionPosition.Mixed;
    }
}
