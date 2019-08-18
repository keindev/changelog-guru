import { CommandLineOptions } from 'command-line-args';
import { Command, CommandType } from './command';
import { Changelog } from '../../changelog';
import { ChangeLevel, ExclusionType } from '../../config/config';

export class GenerateCommand extends Command {
    public constructor() {
        super('generate', 'g', 'Generate changelog');

        this.setOption('bump', 'Bump package version in package.json', CommandType.Boolean);
        this.setOption('branch', 'Set branch by which change log will be generated');
        this.setOption('provider', 'The type of service provider to receive information about the project');
        this.setOption('output', 'File path to write change log to it');
        this.setOption('major', 'The commit types with incompatible API changes', CommandType.List);
        this.setOption('minor', 'The commit types with backwards-compatible and added functionality', CommandType.List);
        this.setOption('patch', 'The commit types with backwards-compatible and bug fixes', CommandType.List);
        this.setOption('excl-authors', 'Excludes authors with the listed logins from output', CommandType.List);
        this.setOption('excl-types', 'Excludes commits with the listed types from output', CommandType.List);
        this.setOption('excl-scopes', 'Excludes commits with the listed scopes from output', CommandType.List);
        this.setOption('excl-subjects', 'Excludes commits with the listed subjects from output', CommandType.List);
    }

    private static appendKeysTo<K, V>(map: Map<K, V>, keys: K[], value: V): void {
        if (Array.isArray(keys) && keys.length) {
            keys.forEach((key): void => {
                map.set(key, value);
            });
        }
    }

    private static appendValuesTo<K, V>(map: Map<K, V[]>, values: V[], key: K): void {
        if (Array.isArray(values) && values.length) {
            map.set(key, values);
        }
    }

    public async execute(options: CommandLineOptions): Promise<void> {
        const { changelogOptions } = this;
        const { types, exclusions } = changelogOptions;
        type Types = NonNullable<typeof types>;
        type Exclusions = NonNullable<typeof exclusions>;

        changelogOptions.provider = options.provider;
        changelogOptions.filePath = options.output;
        changelogOptions.bump = options.bump;
        changelogOptions.branch = options.branch;

        GenerateCommand.appendKeysTo(types as Types, options.major, ChangeLevel.Major);
        GenerateCommand.appendKeysTo(types as Types, options.minor, ChangeLevel.Minor);
        GenerateCommand.appendKeysTo(types as Types, options.patch, ChangeLevel.Patch);

        GenerateCommand.appendValuesTo(exclusions as Exclusions, options['excl-authors'], ExclusionType.AuthorLogin);
        GenerateCommand.appendValuesTo(exclusions as Exclusions, options['excl-types'], ExclusionType.CommitType);
        GenerateCommand.appendValuesTo(exclusions as Exclusions, options['excl-scopes'], ExclusionType.CommitScope);
        GenerateCommand.appendValuesTo(exclusions as Exclusions, options['excl-subjects'], ExclusionType.CommitSubject);

        const changelog = new Changelog(changelogOptions);

        await changelog.build();
    }
}
