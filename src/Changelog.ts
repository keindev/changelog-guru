import dotenv from 'dotenv';

import Builder from './core/Builder';
import { Config, IConfigOptions } from './core/Config';
import { Linter } from './core/Linter';

export type IBuildOptions = Pick<IConfigOptions, 'branch' | 'bump' | 'output' | 'provider'>;
export type ILintOptions = { message?: string; maxLength?: number };

export default class Changelog {
  constructor() {
    dotenv.config();
  }

  async build(options: IBuildOptions): Promise<void> {
    const config = new Config(options);
    const builder = new Builder(config);

    await builder.build();
  }

  async lint({ message, maxLength }: ILintOptions): Promise<void> | never {
    const config = new Config();
    const linter = new Linter(config, maxLength);

    if (message) {
      await linter.lint(message);
    }
  }
}
