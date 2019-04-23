import commander, { Command } from 'commander';
import * as Process from './utils/process';
import { ConfigOptions } from './entities/config';
import Changelog from './changelog';

Process.Instance.start();

commander.version(process.env.npm_package_version || '', '-v, --version')
    .description('Git changelog generator')
    .option('-c, --config <config>', `config file in JSON format.`)
    .option('-c, --config <config>', `config file in JSON format.`);;

const command: Command = commander.parse(process.argv);
const options: ConfigOptions = { config: command.config };
const changelog = new Changelog(options);

changelog.generate().then(() => {
    Process.Instance.end();
});
