import { once } from 'events';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { TaskTree } from 'tasktree-cli';

import { splitHeadline } from '../utils/commit';
import { findSame, unify } from '../utils/text';
import { Config } from './Config';

const SUBJECT_MAX_LENGTH = 10;

export class Linter {
  #config: Config;
  #length: number;

  constructor(config: Config, length = 100) {
    this.#config = config;
    this.#length = length;
  }

  async lint(message: string): Promise<void> {
    const task = TaskTree.add('Lint commit message:');
    // The recommended method to specify -m with husky was `changelog lint -m $HUSKY_GIT_PARAMS`
    // This does not work properly with win32 systems, where env variable declarations use a different syntax
    const parameter = ['HUSKY_GIT_PARAMS', 'GIT_PARAMS'].find(n => [message, `%${n}%`, `$${n}`].includes(n));
    const body: string[] = [];
    let filePath: string | undefined;

    if (!message) task.error('Empty commit message');
    if (parameter && parameter in process.env) filePath = process.env[parameter];
    if (message === '.git/COMMIT_EDITMSG') filePath = path.resolve(process.cwd(), message);
    if (filePath) {
      if (!fs.existsSync(filePath)) task.fail(`${filePath} not found`);

      const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });

      rl.on('line', line => line.trim()[0] !== '#' && body.push(line));
      await once(rl, 'close');
    } else {
      body.push(...message.split('\n'));
    }

    const headline = body.shift() as string;
    const [type, scope, subject] = splitHeadline(headline);
    const changes = this.#config.types.map(([name]) => name);

    if (headline.length > this.#length) task.error(`Header is longer than {bold ${this.#length}}`);
    if (!type) task.error('Type is not defined or is not separated from the subject with "{bold :}"');
    if (type !== unify(type)) task.error('Type is not in lowercase');
    if (!findSame(type, changes)) task.error('Unknown commit type!');
    if (!subject) task.error('Subject is empty');
    if (subject.length <= SUBJECT_MAX_LENGTH) task.error('Subject is not informative');

    task.log(`Header: {dim ${headline || undefined}}`);
    this.#config.rules.forEach(rule => rule.lint && rule.lint({ task, headline, body, type, scope, subject }));

    if (task.haveErrors) task.fail('Incorrect commit message:');
    else task.complete('Commit message is correct');
  }
}
