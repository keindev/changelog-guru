import commander, { Command } from 'commander';
import Process from './utils/process';
import { ConfigOptions } from './entities/config';
import Changelog from './index';

commander.version(Process.getVersion(), '-v, --version')
    .description('Git changelog generator')
    .option('-c, --config <config>', `config file in JSON format.`)
    .option('-c, --config <config>', `config file in JSON format.`);;

Process.start();

const command: Command = commander.parse(process.argv);
const options: ConfigOptions = { config: command.config };
const changelog = new Changelog(options);

changelog.generate().then(() => {
    Process.exit(Process.EXIT_CODE_SUCCES);
    Process.end();
});
