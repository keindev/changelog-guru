import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import generate from './commands/generate';
import lint from './commands/lint';

const argv = yargs(hideBin(process.argv));

argv.command(generate).command(lint).demandCommand().wrap(argv.terminalWidth()).help().parse();

/*
argv
  .commandDir('commands', { extensions: ['js', 'ts'], exclude: /.+\.d\.ts/ })
  .demandCommand()
  .wrap(argv.terminalWidth())
  .help()
  .parse();
*/
