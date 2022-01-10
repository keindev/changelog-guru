import { IPackageChange, PackageDependency, PackageRestriction } from 'package-json-helper/lib/types';
import { Task } from 'tasktree-cli/lib/Task';

import { ICommit } from '../entities/Commit';
import { ISection, ISectionOptions } from '../entities/Section';

export enum Rule {
  Highlight = 'highlight',
  Mark = 'mark',
  PackageStatisticRender = 'package',
  ScopeRename = 'scope',
  SectionGroup = 'section',
}

export interface IRuleContext {
  readonly currentLicense: string;
  readonly hasChangedLicense: boolean;
  readonly previousLicense?: string;

  addSection(options: ISectionOptions): ISection | undefined;
  findSection(name: string): ISection | undefined;
  getChanges(type: PackageDependency | PackageRestriction): IPackageChange[] | undefined;
}

export type IRuleActionOptions = { context: IRuleContext };
export type IRulePrepareOptions = IRuleActionOptions;
export type IRuleModifyOptions = { task: Task } & IRuleActionOptions;
export type IRuleParseOptions = { commit: ICommit } & IRuleActionOptions;
export type IRuleLintOptions = {
  body: string[];
  headline: string;
  scope: string;
  subject: string;
  task: Task;
  type: string;
};

export type IRule = {
  lint?: (options: IRuleLintOptions) => void;
  modify?: (options: IRuleModifyOptions) => void;
  parse?: (options: IRuleParseOptions) => void;
  prepare?: (options: IRulePrepareOptions) => void;
};

export interface IRuleConfig {
  [key: string]: string | boolean | number | string[] | undefined | IRuleConfig | IRuleConfig[];
}

export class BaseRule<T = IRuleConfig> {
  protected config: T;

  constructor(config: T) {
    this.config = config;
  }
}
