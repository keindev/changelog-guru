import { License } from '../../package/license';
import { Section } from '../../entities/section';
import { SectionPosition } from '../../entities/typings/enums';
import { PackageRuleType } from '../../package/typings/types';
import { PackageRule } from '../../package/rules/package-rule';

export interface StateContext {
    getLicense(): License | undefined;
    getPackageRule(type: PackageRuleType): PackageRule | undefined;
    addSection(title: string, position: SectionPosition): Section | undefined;
    findSection(title: string): Section | undefined;
}
