import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import generate from './commands/generate.js';
import lint from './commands/lint.js';

const argv = yargs(hideBin(process.argv));

argv.command(generate).command(lint).demandCommand().wrap(argv.terminalWidth()).help().parse();
