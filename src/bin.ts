import { TaskTree } from 'tasktree-cli';
import commandLineArgs, { CommandLineOptions } from 'command-line-args';
import { Command, CommandName, CommandGenerateOption, CommandLintOption } from './utils/command';
import { Changelog } from './changelog';
import { ChangelogOptions } from './typings/types';
import { ChangeLevel, ExclusionType } from './config/typings/enums';

const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true });
// eslint-disable-next-line no-underscore-dangle
const argv = { argv: mainOptions._unknown || [] };
const changelog = new Changelog();
const taskTree = TaskTree.tree();
let commandOptions: CommandLineOptions;
let changelogOptions: ChangelogOptions;

async function generate(): Promise<void> {
    type Types = NonNullable<typeof changelogOptions.types>;
    type Exclusions = NonNullable<typeof changelogOptions.exclusions>;

    commandOptions = commandLineArgs(Command.getGenerateOptionsDefinition(), argv);
    changelogOptions = {
        types: new Map(),
        exclusions: new Map(),
        provider: commandOptions[CommandGenerateOption.Provider],
        filePath: commandOptions[CommandGenerateOption.Output],
        bump: commandOptions[CommandGenerateOption.Bump],
        branch: commandOptions[CommandGenerateOption.Branch],
    };

    const { types, exclusions } = changelogOptions;

    Command.appendKeysTo(types as Types, commandOptions[CommandGenerateOption.Major], ChangeLevel.Major);
    Command.appendKeysTo(types as Types, commandOptions[CommandGenerateOption.Minor], ChangeLevel.Minor);
    Command.appendKeysTo(types as Types, commandOptions[CommandGenerateOption.Patch], ChangeLevel.Patch);

    Command.appendValuesTo(
        exclusions as Exclusions,
        commandOptions[CommandGenerateOption.ExcludeAuthors],
        ExclusionType.AuthorLogin
    );
    Command.appendValuesTo(
        exclusions as Exclusions,
        commandOptions[CommandGenerateOption.ExcludeTypes],
        ExclusionType.CommitType
    );
    Command.appendValuesTo(
        exclusions as Exclusions,
        commandOptions[CommandGenerateOption.ExcludeScopes],
        ExclusionType.CommitScope
    );
    Command.appendValuesTo(
        exclusions as Exclusions,
        commandOptions[CommandGenerateOption.ExcludeSubjects],
        ExclusionType.CommitSubject
    );

    changelog.setOptions(changelogOptions);
    await changelog.generate();
}

async function lint(): Promise<void> {
    commandOptions = commandLineArgs(Command.getLintOptionsDefinition(), argv);

    await changelog.lint(commandOptions[CommandLintOption.Message]);
}

switch (mainOptions.command) {
    case CommandName.Generate:
    case CommandName.GenerateAlias:
        taskTree.start();

        generate().then((): void => {
            taskTree.stop();
        });
        break;
    case CommandName.Lint:
    case CommandName.LintAlias:
        taskTree.start();

        lint().then((): void => {
            taskTree.stop();
        });
        break;
    default:
        // eslint-disable-next-line no-console
        console.log('help');
        break;
}
