import Section, { SectionPosition, SectionBlock } from '../../entities/section';
import Commit from '../../entities/commit';
import Entity from '../../entities/entity';

export default class SectionManager extends Entity {
    private sections: Map<string, Section> = new Map();
    private relations: Map<string, Section> = new Map();

    public add(title: string, position?: SectionPosition | number, block?: SectionBlock): Section | undefined {
        let section: Section | undefined;

        if (typeof title === 'string') {
            const sectionTitle = title.trim().toLowerCase();

            if (sectionTitle.length) {
                section = this.sections.get(sectionTitle);

                if (typeof section === 'undefined') {
                    section = new Section(title.trim(), block || SectionBlock.Mixed, position || SectionPosition.Any);
                    this.sections.set(sectionTitle, section);
                }
            }
        }

        return section;
    }

    public assign(section: Section, commit: Commit): void {
        if (commit.isValid() && commit.isVisible()) {
            const { relations } = this;
            const assignedSection: Section | undefined = relations.get(commit.sha);

            if (typeof assignedSection === 'undefined') {
                this.debug('%s: related to "%s"', commit.sha, section.title);
                relations.set(commit.sha, section);
            } else if (section.isHigherThan(assignedSection)) {
                this.debug('%s: change "%s" to "%s"', commit.sha, assignedSection.title, section.title);
                relations.set(commit.sha, section);
            }
        }
    }
}
