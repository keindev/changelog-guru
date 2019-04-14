import commander, { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import Process from './utils/process';
import Changelog, { Options } from './index';
import * as Debug from "debug";

commander.version(Process.getVersion(), '-v, --version')
    .description('GitHub changelog generator')
    .option('-c, --config <config>', `config file in JSON format.`)
    .option('-d, --debug', `enable debugging mode.`)

const command: Command = commander.parse(process.argv);
let config: string = '';

if (typeof command.config === 'string') {
    config = path.resolve(process.cwd(), command.config);

    if (!fs.existsSync(config)) {
        Process.error('<config> option is not an existing filename', false);
        commander.help();
        Process.exit();
    }
}

if (command.debug) {
    Debug.enable([Process.DEBUG_NAMESPACE, '*'].join(':'));
}

const options: Options = { config };
const changelog = new Changelog(options);

changelog.generate().then(() => {
    Process.exit(Process.EXIT_CODE_SUCCES);
});
