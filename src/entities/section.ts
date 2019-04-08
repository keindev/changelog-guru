import Commit from './commit';
import Entity from './entity';

export enum SectionBlock {
    Header,
    Mixed,
    Body,
    Footer,
}

export enum SectionPosition {
    Any = 0,
    Top = -1,
    Bottom = -2
}

export default class Section extends Entity {
    public readonly block: SectionBlock;
    public readonly position: number;
    public readonly title: string;

    private commits: Map<string, Commit> = new Map();

    public constructor(title: string, block: SectionBlock, position: SectionPosition | number) {
        super(title);

        this.title = title;
        this.block = block;
        this.position = Math.max(position, SectionPosition.Bottom);
    }

    public assign(commit: Commit): void {
        if (commit.isValid() && commit.isVisible()) {
            this.debug('%s: %s', this.title, commit.sha);
            this.commits.set(commit.sha, commit);
        }
    }
}
