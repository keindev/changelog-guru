import commander from 'commander';
import { TaskTree } from 'tasktree-cli';
import { Changelog } from './changelog';
import { ExclusionType, ChangeLevel } from './config/typings/enums';
import { ChangelogOptions } from './typings/types';
import { CLI } from './utils/cli';

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .usage('[options]')
    .option('--bump', 'Bump package version in package.json')
    .option('--branch <value>', 'Set branch by which change log will be generated')
    .option('--provider <value>', 'The type of service provider to receive information about the project')
    .option('--output <value>', 'File path to write change log to it')
    .option('--major <items>', 'The commit types with incompatible API changes', CLI.splitToList)
    .option('--minor <items>', 'The commit types with backwards-compatible and added functionality', CLI.splitToList)
    .option('--patch <items>', 'The commit types with backwards-compatible and bug fixes', CLI.splitToList)
    .option('--excl-authors <items>', 'Excludes authors with the listed logins from output', CLI.splitToList)
    .option('--excl-types <items>', 'Excludes commits with the listed types from output', CLI.splitToList)
    .option('--excl-scopes <items>', 'Excludes commits with the listed scopes from output', CLI.splitToList)
    .option('--excl-subjects <items>', 'Excludes commits with the listed subjects from output', CLI.splitToList)
    .description('Git changelog generator')
    .parse(process.argv);

const taskTree = TaskTree.tree();
const options: ChangelogOptions = {
    types: new Map(),
    exclusions: new Map(),
    provider: commander.provider,
    filePath: commander.output,
    bump: commander.bump,
    branch: commander.branch,
};

CLI.appendKeysTo(options.types as NonNullable<typeof options.types>, commander.major, ChangeLevel.Major);
CLI.appendKeysTo(options.types as NonNullable<typeof options.types>, commander.minor, ChangeLevel.Minor);
CLI.appendKeysTo(options.types as NonNullable<typeof options.types>, commander.patch, ChangeLevel.Patch);
CLI.appendValuesTo(
    options.exclusions as NonNullable<typeof options.exclusions>,
    commander.exclAuthors,
    ExclusionType.AuthorLogin
);
CLI.appendValuesTo(
    options.exclusions as NonNullable<typeof options.exclusions>,
    commander.exclTypes,
    ExclusionType.CommitType
);
CLI.appendValuesTo(
    options.exclusions as NonNullable<typeof options.exclusions>,
    commander.exclScopes,
    ExclusionType.CommitScope
);
CLI.appendValuesTo(
    options.exclusions as NonNullable<typeof options.exclusions>,
    commander.exclSubjects,
    ExclusionType.CommitSubject
);

taskTree.start();

const changelog = new Changelog(options);

changelog.generate().then((): void => {
    taskTree.stop();
});
