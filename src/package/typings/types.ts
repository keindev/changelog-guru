import { DependencyRuleType, RestrictionRuleType } from '../rules/typings/enums';

export type PackageRestrictions = string[];
export type PackageRuleType = DependencyRuleType | RestrictionRuleType;
export type PackageDependenciesStory = [PackageDependencies | undefined, PackageDependencies | undefined];
export type PackageRestrictionsStory = [PackageRestrictions | undefined, PackageRestrictions | undefined];

export interface PackageDependencies {
    [key: string]: string;
}
