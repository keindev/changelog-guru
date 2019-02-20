import commander, { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import packageJson from '../package.json';
import { Process } from './process';

export default class CLI {

    public static CONFIG_FILE_NAME: string = '.changelog';
    public static TOKEN_ENV_NAME: string = 'CHANGELOG_GURU_TOKEN';

    public static showHelp(msg: string) {
        Process.error(msg, false);
        commander.help();
        Process.exit();
    }

    constructor() {
        commander.version(packageJson.version, '-v, --version');
        commander.description(packageJson.description);
        commander.option('-c, --config <config>', `config file in JSON format (${CLI.CONFIG_FILE_NAME}).`);
        commander.option('-p, --package <package>', `path to package.json.`);
        commander.option('-t, --token <token>', `your GitHub access token (${CLI.TOKEN_ENV_NAME} by default).`);
    }

    public parse(cwd: string, argv: string[]): string[] {
        const command: Command = commander.parse(argv);
        const resolve = (pathSegment: string) => path.resolve(cwd, pathSegment);
        const configPath: string = resolve(command.config || path.join(__dirname, `../${CLI.CONFIG_FILE_NAME}`));
        const packagePath: string = resolve(command.package || 'package.json');
        const token: string = command.token || process.env[CLI.TOKEN_ENV_NAME];

        if (!fs.existsSync(configPath)) CLI.showHelp('<config> options is not an existing filename');
        if (!fs.existsSync(packagePath)) CLI.showHelp('<package> package.json not found');
        if (!token) CLI.showHelp('<token> options must be provided');

        return [configPath, packagePath, token];
    }
}
