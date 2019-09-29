import yargs from 'yargs';

yargs
    .commandDir('commands')
    .demandCommand()
    .wrap(yargs.terminalWidth())
    .help()
    .parse();
