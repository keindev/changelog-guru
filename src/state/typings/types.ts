import { License } from '../../package/license';
import { DependencyType } from '../../package/typings/enums';
import { Dependency } from '../../package/dependency';
import { Section } from '../../entities/section';
import { SectionPosition } from '../../entities/typings/enums';

export interface StateContext {
    getLicense(): License | undefined;
    getDependencies(type: DependencyType): Dependency | undefined;
    addSection(title: string, position: SectionPosition): Section | undefined;
    findSection(title: string): Section | undefined;
}
