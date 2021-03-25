import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import path from 'path';
import { TaskTree } from 'tasktree-cli';

import { ChangeLevel } from './entities/Entity';
import { BaseRule, IRule, IRuleConfig, Rule } from './rules/BaseRule';
import HighlightRule from './rules/HighlightRule';
import MarkRule from './rules/MarkRule';
import PackageStatisticRenderRule from './rules/PackageStatisticRenderRule';
import ScopeRenameRule from './rules/ScopeRenameRule';
import SectionGroupRule from './rules/SectionGroupRule';

export enum Exclusion {
  AuthorLogin = 'authorLogin',
  CommitType = 'commitType',
  CommitScope = 'commitScope',
  CommitSubject = 'commitSubject',
}

export enum GitServiceProvider {
  GitHub = 'github',
  GitLab = 'gitlab',
}

export interface IConfigOptions {
  bump?: boolean;
  branch?: string;
  provider?: GitServiceProvider;
  output?: string;
}

export interface IChangelogConfig {
  provider: GitServiceProvider;
  branch: string;
  changes: {
    [key in ChangeLevel]: string[];
  };
  output: {
    filePath: string;
    exclude: { [key in Exclusion]: string[] };
  };
  rules: {
    [key in Rule]: IRuleConfig;
  };
}

export class Config {
  #options: IConfigOptions;
  #provider = GitServiceProvider.GitHub;
  #branch = '';
  #filePath = 'CHANGELOG.md';
  #exclusions: [Exclusion, string[]][] = [];
  #types: [string, ChangeLevel][] = [];
  #rules: IRule[] = [];

  constructor(options?: IConfigOptions) {
    if (options?.provider && !Object.values(GitServiceProvider).includes(options.provider)) {
      TaskTree.fail('Service provider not supported');
    }

    this.#options = options ?? {};
  }

  get provider(): GitServiceProvider {
    return this.#provider;
  }

  get branch(): string {
    return this.#branch;
  }

  get filePath(): string {
    return this.#filePath;
  }

  get exclusions(): [Exclusion, string[]][] {
    return this.#exclusions;
  }

  get types(): [string, ChangeLevel][] {
    return this.#types;
  }

  get rules(): IRule[] {
    return this.#rules;
  }

  get bump(): boolean {
    return !!this.#options.bump;
  }

  async init(): Promise<void> {
    const task = TaskTree.add('Reading configuration file...');
    const explorer = cosmiconfig('changelog-guru');
    const baseConf = await explorer.load(path.join(__dirname, '../../.changelogrc.default.yml'));
    const userConf = await explorer.search();

    if (baseConf?.config && !baseConf.isEmpty) {
      const config = deepmerge<IChangelogConfig>(baseConf.config, userConf?.config ?? {});

      task.log(`Config file: {bold ${path.relative(process.cwd(), userConf?.filepath ?? baseConf.filepath)}}`);
      task.complete('Configuration initialized with:');

      this.#types = this.getTypes(config.changes);
      this.#rules = this.getRules(config.rules);
      this.#provider = this.#options?.provider ?? config.provider;
      this.#branch = this.#options?.branch ?? config.branch;
      this.#filePath = this.#options?.output ?? config.output.filePath;
      this.#exclusions = Object.entries(config.output.exclude ?? {}).map(([name, rules]) => {
        if (!Object.values(Exclusion).includes(name as Exclusion)) {
          TaskTree.fail(`Unexpected exclusion name: {bold ${name}}`);
        }

        return [name as Exclusion, [...new Set(rules)]];
      });
    } else {
      task.fail('Default configuration file not found');
    }
  }

  private getTypes(changes: IChangelogConfig['changes']): [string, ChangeLevel][] {
    const levels = Object.values(ChangeLevel);

    return Object.entries(changes).reduce((acc, [level, names]) => {
      if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
      if (!levels.includes(level as ChangeLevel)) TaskTree.fail(`Unexpected level "${level}" of changes`);

      names.forEach(name => acc.push([name, level as ChangeLevel]));

      return acc;
    }, [] as [string, ChangeLevel][]);
  }

  private getRules(configs: IChangelogConfig['rules']): IRule[] {
    const map = {
      [Rule.Highlight]: HighlightRule,
      [Rule.Mark]: MarkRule,
      [Rule.PackageStatisticRender]: PackageStatisticRenderRule,
      [Rule.ScopeRename]: ScopeRenameRule,
      [Rule.SectionGroup]: SectionGroupRule,
    };

    return [...Object.values(Rule)].map(rule => new (map[rule] as typeof BaseRule)(configs[rule]) as IRule);
  }
}
