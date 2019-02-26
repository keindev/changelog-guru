import commander, { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import Process from './utils/process';
import Changelog, { Options } from './index';

commander.version(Process.getVersion(), '-v, --version')
    .description('GitHub changelog generator')
    .option('-c, --config <config>', `config file in JSON format.`)
    .option('-t, --token <token>', `your GitHub access token.`)

function showHelp(msg: string): void {
    Process.error(msg, false);
    commander.help();
    Process.exit();
}

const command: Command = commander.parse(process.argv);
const configPath: string = path.resolve(process.cwd(), command.config || path.join(__dirname, '../.changelog.yaml'));

if (!fs.existsSync(configPath)) showHelp('<config> option is not an existing filename');

const options: Options = { configPath, token: command.token };
const changelog = new Changelog(options);

changelog.generate().then(() => {
    Process.exit(Process.EXIT_CODE_SUCCES);
});
