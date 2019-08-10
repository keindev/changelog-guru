import { OptionDefinition } from 'command-line-args';

export enum CommandName {
    Generate = 'generate',
    GenerateAlias = 'g',
    Lint = 'lint',
    LintAlias = 'l',
}

export enum CommandDescription {
    Generate = 'Generate changelog file',
    Lint = 'Lint commit message',
}

export enum CommandGenerateOption {
    Bump = 'bump',
    Branch = 'branch',
    BranchAlias = 'b',
    Provider = 'provider',
    ProviderAlias = 'p',
    Output = 'output',
    OutputAlias = 'o',
    Major = 'major',
    Minor = 'minor',
    Patch = 'patch',
    ExcludeAuthors = 'excl-authors',
    ExcludeTypes = 'excl-types',
    ExcludeScopes = 'excl-scopes',
    ExcludeSubjects = 'excl-subjects',
}

export enum CommandGenerateOptionDescription {
    Bump = 'Bump package version in package.json',
    Branch = 'Set branch by which change log will be generated',
    Provider = 'The type of service provider to receive information about the project',
    Output = 'File path to write change log to it',
    Major = 'The commit types with incompatible API changes',
    Minor = 'The commit types with backwards-compatible and added functionality',
    Patch = 'The commit types with backwards-compatible and bug fixes',
    ExcludeAuthors = 'Excludes authors with the listed logins from output',
    ExcludeTypes = 'Excludes commits with the listed types from output',
    ExcludeScopes = 'Excludes commits with the listed scopes from output',
    ExcludeSubjects = 'Excludes commits with the listed subjects from output',
}

export enum CommandLintOption {
    Message = 'message',
    MessageAlias = 'm',
}

export enum CommandLintOptionDescription {
    Message = 'Lint commit message',
}

export class Command {
    public static appendKeysTo<K, V>(map: Map<K, V>, keys: K[], value: V): void {
        if (Array.isArray(keys) && keys.length) {
            keys.forEach((key): void => {
                map.set(key, value);
            });
        }
    }

    public static appendValuesTo<K, V>(map: Map<K, V[]>, values: V[], key: K): void {
        if (Array.isArray(values) && values.length) {
            map.set(key, values);
        }
    }

    public static getLintOptionsDefinition(): OptionDefinition[] {
        return [
            {
                name: CommandLintOption.Message,
                alias: CommandLintOption.MessageAlias,
                type: String,
                defaultOption: true,
            },
        ];
    }

    public static getGenerateOptionsDefinition(): OptionDefinition[] {
        return [
            {
                name: CommandGenerateOption.Bump,
                type: Boolean,
            },
            {
                name: CommandGenerateOption.Branch,
                alias: CommandGenerateOption.BranchAlias,
                type: String,
            },
            {
                name: CommandGenerateOption.Provider,
                alias: CommandGenerateOption.ProviderAlias,
                type: String,
            },
            {
                name: CommandGenerateOption.Output,
                alias: CommandGenerateOption.OutputAlias,
                type: String,
            },
            {
                name: CommandGenerateOption.Major,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.Minor,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.Patch,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.ExcludeAuthors,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.ExcludeTypes,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.ExcludeScopes,
                type: String,
                multiple: true,
            },
            {
                name: CommandGenerateOption.ExcludeSubjects,
                type: String,
                multiple: true,
            },
        ];
    }
}
