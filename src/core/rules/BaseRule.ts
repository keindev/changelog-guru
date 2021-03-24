import { Task } from 'tasktree-cli/lib/Task';

import { ICommit } from '../entities/Commit';
import { ISection, SectionOrder, SectionPosition } from '../entities/Section';
import { Dependency, IPackageChange, Restriction } from '../Package';

export enum Rule {
  Highlight = 'highlight',
  Mark = 'mark',
  PackageStatisticRender = 'package',
  ScopeRename = 'scope',
  SectionGroup = 'section',
}

export interface IRuleContext {
  readonly currentLicense: string;
  readonly previousLicense?: string;
  readonly hasChangedLicense: boolean;

  getChanges(type: Dependency | Restriction): IPackageChange[] | undefined;
  addSection(title: string, position?: SectionPosition, order?: SectionOrder): ISection | undefined;
  findSection(title: string): ISection | undefined;
}

export type IRuleActionOptions = { context: IRuleContext };
export type IRulePrepareOptions = IRuleActionOptions;
export type IRuleModifyOptions = { task: Task } & IRuleActionOptions;
export type IRuleParseOptions = { commit: ICommit } & IRuleActionOptions;
export type IRuleLintOptions = {
  task: Task;
  headline: string;
  body: string[];
  type: string;
  scope: string;
  subject: string;
};

export type IRule = {
  prepare?: (options: IRulePrepareOptions) => void;
  modify?: (options: IRuleModifyOptions) => void;
  parse?: (options: IRuleParseOptions) => void;
  lint?: (options: IRuleLintOptions) => void;
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
