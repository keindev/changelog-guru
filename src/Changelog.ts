import dotenv from 'dotenv';

import Builder from './core/Builder';
import { Config, GitServiceProvider } from './core/Config';
import { Linter } from './core/Linter';

export type IBuildOptions = {
  /** Bumps package version in package.json if specified */
  bump?: boolean;
  /** Sets the branch by which the change log will be generated */
  branch?: string;
  /** Specifies the type of service provider to receive project information */
  provider?: GitServiceProvider;
  /** Output file path */
  output?: string;
};

export type ILintOptions = {
  /** Commit message for linting */
  message?: string;
  /** Max commit header length */
  maxLength?: number;
};

/**
 * Changelog manger
 */
export class Changelog {
  constructor() {
    dotenv.config();
  }

  /** Generate changelog file */
  async generate(options?: IBuildOptions): Promise<void> {
    const config = new Config(options);
    const builder = new Builder(config);

    await builder.build();
  }

  /** Lint commit message */
  async lint(options?: ILintOptions): Promise<void> | never {
    const config = new Config();
    const linter = new Linter(config, options?.maxLength);

    if (options?.message) {
      await linter.lint(options.message);
    }
  }
}

export default Changelog;
