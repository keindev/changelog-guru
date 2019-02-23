import commander, { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import packageJson from '../package.json';
import Process from './process';

export default class CLI {
    public static CONFIG_FILE_NAME: string = '.changelog';
    public static ENV_TOKEN_NAME: string = 'CHANGELOG_GURU_TOKEN';

    public static help(): void {
        commander.help();
    }

    public static showHelp(msg: string): void {
        Process.error(msg, false);
        CLI.help();
        Process.exit();
    }

    public static parse(): string[] {
        const command: Command = commander.parse(Process.getArguments());
        const getPath = (pathSegment: string): string => path.resolve(Process.CWD, pathSegment);
        const configPath: string = getPath(command.config || path.join(__dirname, `../${CLI.CONFIG_FILE_NAME}`));
        const packagePath: string = getPath(command.package || 'package.json');
        const token: string = command.token || Process.getVariable(CLI.ENV_TOKEN_NAME);

        if (!fs.existsSync(configPath)) CLI.showHelp('<config> options is not an existing filename');
        if (!fs.existsSync(packagePath)) CLI.showHelp('<package> package.json not found');
        if (!token) CLI.showHelp('<token> options must be provided');

        return [configPath, packagePath, token];
    }
}

commander.version(packageJson.version, '-v, --version');
commander.description(packageJson.description);
commander.option('-c, --config <config>', `config file in JSON format (${CLI.CONFIG_FILE_NAME}).`);
commander.option('-p, --package <package>', `path to package.json.`);
commander.option('-t, --token <token>', `your GitHub access token (${CLI.ENV_TOKEN_NAME} by default).`);
