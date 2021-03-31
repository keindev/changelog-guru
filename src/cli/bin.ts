import yargs from 'yargs';

yargs
  .commandDir('commands', { extensions: ['js', 'ts'], exclude: /.+\.d\.ts/ })
  .demandCommand()
  .wrap(yargs.terminalWidth())
  .help()
  .parse();
