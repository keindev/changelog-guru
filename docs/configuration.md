# Configuration

## Levels of changes

| Default     | CLI Override      | API Override      |
| ----------- | ----------------- | ----------------- |
| _see below_ | `--major <items>` | `major: string[]` |
| _see below_ | `--minor <items>` | `minor: string[]` |
| _see below_ | `--patch <items>` | `patch: string[]` |

Default level of changes:

```YAML
changes:
    major:
        - break
    minor:
        - feat
        - improve
    patch:
        - fix
        - chore
        - refactor
        - test
        - docs
        - build
        - types
        - style
        - workflow
        - perf
        - revert
```

For a list of change types by level, see [SemVer](https://semver.org/). The commits with the specified types will be distributed by change levels. For example:

```

// Commit message with MINOR changes
feat(Core): add awesome feature

```

The following types of changes are defined by default:

-   **MAJOR** version:
    -   `break` - breaking changes
-   **MINOR** version:
    -   `feat` - new features
    -   `improve` - features improvements
-   **PATCH** version:
    -   `fix` - some bugs fixing
    -   `chore` - minor changes
    -   `refactor` - code refactoring
    -   `test` - add or change tests
    -   `docs` - documentation changes
    -   `build` - package changes, release
    -   `types` - code typing
    -   `style` - `css`/`scss`/_other_, style sheet change
    -   `workflow` - workflow changes
    -   `perf` - performance improvements
    -   `revert` - reverted changes

## Output options

Parameters of the output file. Specify the path to the file and the excluded entities.

Default output options:

```YAML
output:
    filePath: CHANGELOG.md
    exclude:
        authorLogin: ['dependabot-preview[bot]']
        commitType: ['build']
        commitScope: ['deps', 'deps-dev']
        commitSubject: ['merge']
```

### filePath

File path to write change log to it.

| Default        | CLI Override      | API Override       |
| -------------- | ----------------- | ------------------ |
| `CHANGELOG.md` | `--output <path>` | `filePath: string` |

### exclude

One way to filter output by ignoring commits with a given type, scope, subject, or from certain authors. To find out about other ways to ignore commits, see the section [Plugins](#plugins)

| Default                                 | CLI Override              | API Override              |
| --------------------------------------- | ------------------------- | ------------------------- |
| _[see output example](#output-options)_ | `--excl-authors<items>`   | `authorLogin: string[]`   |
| _[see output example](#output-options)_ | `--excl-types <items>`    | `commitType: string[]`    |
| _[see output example](#output-options)_ | `--excl-scopes <items>`   | `commitScope: string[]`   |
| _[see output example](#output-options)_ | `--excl-subjects <items>` | `commitSubject: string[]` |

-   **authorLogin** - excludes authors with the listed logins from the output file
-   **commitType** - excludes commits with the listed [types](#commit-structure) from the output file
-   **commitScope** - excludes commits with the listed [scopes](#commit-structure) from the output file
-   **commitSubject** - excludes commits with the listed [subjects](#commit-structure) from the output file

## Other CLI options

| Default                           | CLI             | Description                                                                                                                                      |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `false`                           | `--bump`        | Based on data about changes made in the project, forms the next version number and bumps it in `package.json`, see [SemVer](https://semver.org/) |
| _current branch from .git folder_ | `--branch`      | Set branch by which change log will be generated                                                                                                 |
| -                                 | `-v, --version` | Show `changelog-guru` package version                                                                                                            |
| -                                 | `--help`        | Show `changelog-guru` cli options help                                                                                                           |

## Plugins

All plugin settings are described in the special section `plugins` of the configuration as follows:

```YAML
plugins:
    <plugin name>:
        <plugins option>
        ...
        <plugins option>
```
