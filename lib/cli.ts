import * as fs from 'fs';
import * as path from 'path';
import program, { Command } from 'commander';
import libPackage from './../package.json';
import Utils from './utils';

export default class CLI {
    static CONFIG_FILE_NAME: string = '.changelog';
    static TOKEN_ENV_NAME: string = 'CHANGELOG_GURU_TOKEN';

    private cwd: string = '';

    static showHelp(msg: string) {
        Utils.error(msg, false);
        program.help();
        Utils.exit();
    }

    constructor(cwd: string) {
        this.cwd = cwd;

        program.version(libPackage.version, '-v, --version');
        program.description(libPackage.description);
        program.option('-c, --config <config>', `config file in JSON format (${CLI.CONFIG_FILE_NAME}).`);
        program.option('-p, --package <package>', `path to package.json.`);
        program.option('-t, --token <token>', `your GitHub access token (${CLI.TOKEN_ENV_NAME} by default).`);
    }

    public parse(argv: string[]): string[] {
        const command: Command = program.parse(argv);
        const resolve = (pathSegment: string) => path.resolve(this.cwd, pathSegment);
        const configPath: string = resolve(command.config || path.join(__dirname, `../${CLI.CONFIG_FILE_NAME}`));
        const packagePath: string = resolve(command.package || 'package.json');
        const token: string = command.token || process.env[CLI.TOKEN_ENV_NAME];

        if (!fs.existsSync(configPath)) CLI.showHelp('<config> options is not an existing filename');
        if (!fs.existsSync(packagePath)) CLI.showHelp('<package> package.json not found');
        if (!token) CLI.showHelp('<token> options must be provided');

        return [configPath, packagePath, token];
    }
}
