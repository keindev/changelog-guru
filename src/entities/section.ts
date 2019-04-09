import Entity from './entity';

export enum SectionBlock {
    Mixed = 0,
    Header = 1,
    Body = 2,
    Footer = 3,
}

export enum SectionPosition {
    Any = 0,
    Top = -1,
    Bottom = -2,
}

export default class Section extends Entity {
    public readonly title: string;
    public readonly block: SectionBlock;
    public readonly position: SectionPosition | number;

    public constructor(title: string, block: SectionBlock, position: SectionPosition | number) {
        super(title);

        this.title = title;
        this.block = block;
        this.position = Math.max(position, SectionPosition.Bottom);
    }

    public isHigherThan(section: Section): boolean {
        return this.block > section.block || (this.block === section.block && this.position < section.position);
    }
}
