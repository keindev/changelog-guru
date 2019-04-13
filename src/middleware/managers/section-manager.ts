import Section, { SectionPosition } from '../../entities/section';
import Entity from '../../entities/entity';
import Commit from '../../entities/commit';

export default class SectionManager extends Entity {
    private static MAX_TITLE_DIFF_PERCENT: number = .2;
    private sections: Section[] = [];
    private relations: Map<number, Set<string>> = new Map();

    public create(title: string, position: SectionPosition = SectionPosition.Mixed): number {
        const { sections } = this;
        const trimmedTitle = Section.trim(title);
        let index: number = sections.findIndex((s) => SectionManager.isEqual(s.trimmedTitle, trimmedTitle));

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

    private static isEqual(a: string, b: string): boolean {
        let result: boolean = true;

        if (a !== b) {
            const matrix = [];
            const { length: lengthA } = a;
            const { length: lengthB } = b;
            let i: number = 0;
            let j: number = 0;

            while (i <= lengthB) matrix[i] = [i++];
            while (j <= lengthA) matrix[0][j] = j++;

            let m: number;
            let n: number;

            for (i = 1, m = 0; i <= lengthB; i++, m++) {
                for (j = 1, n = 0; j <= lengthA; j++, n++) {
                    matrix[i][j] = b.charAt(m) === a.charAt(n)
                        ? matrix[m][n]
                        : Math.min(matrix[m][n] + 1, Math.min(matrix[i][n] + 1, matrix[m][j] + 1));
                }
            }

            result = (matrix[lengthB][lengthA] / lengthA) <= SectionManager.MAX_TITLE_DIFF_PERCENT;
        }

        return result;
    }
}
