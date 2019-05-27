import { TaskTree } from 'tasktree-cli';
import commander, { Command } from 'commander';
import { ConfigOptions } from './entities/config';
import Changelog from './changelog';

const $tasks = TaskTree.tree();

$tasks.start();

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .description('Git changelog generator')
    .option('-c, --config <config>', `config file in JSON format.`)
    .option('-c, --config <config>', `config file in JSON format.`);

const command: Command = commander.parse(process.argv);
const options: ConfigOptions = { config: command.config };
const changelog = new Changelog(options);

changelog.generate().then(
    (): void => {
        $tasks.stop();
    }
);
