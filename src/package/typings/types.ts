import { SemVer } from 'semver';
import { DependencyModification } from './enums';

export type PackageDependenciesStories = [PackageDependency | undefined, PackageDependency | undefined];

export interface PackageDependency {
    [key: string]: string;
}

export interface DependencyInfo {
    name: string;
    type: DependencyModification;
    value?: string;
    prevValue?: string;
    version?: SemVer;
    prevVersion?: SemVer;
}
