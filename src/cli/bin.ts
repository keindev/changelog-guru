import * as yargs from 'yargs';

yargs
    .commandDir('commands')
    .demandCommand()
    .help()
    .wrap(yargs.terminalWidth())
    .parse();
