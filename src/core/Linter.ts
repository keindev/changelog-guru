import { once } from 'events';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/Task';

import { splitHeadline } from '../utils/commit';
import { findSame, unify } from '../utils/text';
import { Config } from './Config';

const SUBJECT_MAX_LENGTH = 10;
const GIT_PARAMETERS = ['HUSKY_GIT_PARAMS', 'GIT_PARAMS'];
const GIT_MESSAGES_PATHS = ['.git/COMMIT_EDITMSG', '.git/MERGE_MSG', '.git/SQUASH_MSG'];

export class Linter {
  #config: Config;
  #length: number;

  constructor(config: Config, length = 100) {
    this.#config = config;
    this.#length = length;
  }

  async lint(text: string): Promise<void> {
    const task = TaskTree.add('Lint commit message:');

    await this.#config.init();

    const parameter = GIT_PARAMETERS.find(n => [text, `%${n}%`, `$${n}`].includes(n));
    const message: string[] = [];
    let filePath: string | undefined;

    if (!text) task.error('Empty commit message');
    if (parameter && parameter in process.env) filePath = process.env[parameter];
    if (GIT_MESSAGES_PATHS.includes(text)) filePath = path.resolve(process.cwd(), text);
    if (filePath) {
      if (!fs.existsSync(filePath)) task.fail(`${filePath} not found`);

      const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });

      rl.on('line', line => line.trim()[0] !== '#' && message.push(line));
      await once(rl, 'close');
    } else {
      message.push(...text.split('\n'));
    }

    this.lintMessage(task, message);

    if (task.haveErrors) {
      task.fail('Incorrect commit message:');
    } else {
      task.complete('Commit message is correct', true);
    }
  }

  private lintMessage(task: Task, message: string[]): void {
    const [headline, ...body] = message;

    if (headline) {
      const [type, scope, subject] = splitHeadline(headline);
      const types = this.#config.types.map(([name]) => name);

      if (headline.length > this.#length) {
        task.error(`Headline has a length of ${headline.length}. Maximum allowed is {bold ${this.#length}}`);
      }

      if (!type || !findSame(type, types)) task.error('Unknown commit type!');
      if (type !== unify(type)) task.error('Type is not in lowercase');

      if (type) {
        if (!subject) task.error('Subject is empty');
        if (subject && subject.length <= SUBJECT_MAX_LENGTH) task.error('Subject is not informative');
      }

      this.#config.rules.forEach(rule => {
        if (rule.lint) {
          rule.lint({ task, headline, body, type, scope, subject });
        }
      });
    } else {
      task.error('Headline is empty');
    }
  }
}
