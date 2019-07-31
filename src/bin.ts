import commander from 'commander';
import { TaskTree } from 'tasktree-cli';
import { Changelog } from './changelog';
import { ExclusionType, ChangeLevel } from './config/typings/enums';

const tasks = TaskTree.tree();
const list = (values: string): string[] => values.split(',');

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .usage('[options]')
    .option('--bump', 'Bump package version in package.json')
    .option('--provider <value>', 'The type of service provider to receive information about the project')
    .option('--output <value>', 'File path to write change log to it')
    .option('--changes-major <items>', 'The commit types with incompatible API changes', list, [])
    .option('--changes-minor <items>', 'The commit types with backwards-compatible and added functionality', list, [])
    .option('--changes-patch <items>', 'The commit types with backwards-compatible and bug fixes', list, [])
    .option('--exclude-authors <items>', 'Excludes authors with the listed logins from the output file', list, [])
    .option('--exclude-types <items>', 'Excludes commits with the listed types from the output file', list, [])
    .option('--exclude-scopes <items>', 'Excludes commits with the listed scopes from the output file', list, [])
    .option('--exclude-subjects <items>', 'Excludes commits with the listed subjects from the output file', list, [])
    .description('Git changelog generator')
    .parse(process.argv);

tasks.start();

const changelog = new Changelog({
    types: new Map([
        ...commander.changesMajor.map((type: string): [string, ChangeLevel] => [type, ChangeLevel.Major]),
        ...commander.changesMinor.map((type: string): [string, ChangeLevel] => [type, ChangeLevel.Minor]),
        ...commander.changesPatch.map((type: string): [string, ChangeLevel] => [type, ChangeLevel.Patch]),
    ]),
    exclusions: new Map([
        [ExclusionType.AuthorLogin, commander.excludeAuthors],
        [ExclusionType.CommitType, commander.excludeTypes],
        [ExclusionType.CommitScope, commander.excludeScopes],
        [ExclusionType.CommitSubject, commander.excludeSubjects],
    ]),
    provider: commander.provider,
    filePath: commander.output,
    bump: commander.bump,
});

changelog.generate().then((): void => {
    tasks.stop();
});
