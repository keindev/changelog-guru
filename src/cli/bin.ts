import yargs from 'yargs';

yargs
  .commandDir('commands', { extensions: ['js', 'ts'] })
  .demandCommand()
  .wrap(yargs.terminalWidth())
  .help()
  .parse();
