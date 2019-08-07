import { SemVer } from 'semver';
import { PackageRuleChangeType } from './enums';

export interface PackageRuleChange {
    name: string;
    type: PackageRuleChangeType;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;
}
