# Configuration

See full **changelog-guru** configuration [file](../.changelogrc.default.yaml)

## Provider

Specifies the type of service provider to receive project information.

| Default  | CLI Override        | API Override       |
| -------- | ------------------- | ------------------ |
| `github` | `--provider <name>` | `provider: string` |

## Levels of changes

Commit levels of changes.

| Default     | CLI Override      | API Override      |
| ----------- | ----------------- | ----------------- |
| _see below_ | `--major <items>` | `major: string[]` |
| _see below_ | `--minor <items>` | `minor: string[]` |
| _see below_ | `--patch <items>` | `patch: string[]` |

Default level of changes:

```YAML
changes:
    # Incompatible API changes
    major:
        - break
    # New functionality with backwards compatible
    minor:
        - feat
        - improve
    # Backwards compatible bug fixes
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
    -   `break` - Breaking changes
-   **MINOR** version:
    -   `feat` - New features
    -   `improve` - Features improvements
-   **PATCH** version:
    -   `fix` - Some bugs fixing
    -   `chore` - Minor changes
    -   `refactor` - Code refactoring
    -   `test` - Adding or modifying tests
    -   `docs` - Documentation changes
    -   `build` - Package changes, releases, merging
    -   `types` - Code typing
    -   `style` - `CSS`, `SCSS`, and other style sheets changes
    -   `workflow` - Workflow changes
    -   `perf` - Performance improvements
    -   `revert` - Reverted changes

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

One way to filter output by ignoring commits with a given type, scope, subject, or from certain authors. To find out about other ways to ignore commits, see the section [Plugins](plugins/plugins.md)

| Default                                 | CLI Override              | API Override              |
| --------------------------------------- | ------------------------- | ------------------------- |
| _[see output example](#output-options)_ | `--excl-authors<items>`   | `authorLogin: string[]`   |
| _[see output example](#output-options)_ | `--excl-types <items>`    | `commitType: string[]`    |
| _[see output example](#output-options)_ | `--excl-scopes <items>`   | `commitScope: string[]`   |
| _[see output example](#output-options)_ | `--excl-subjects <items>` | `commitSubject: string[]` |

-   **authorLogin** - Excludes authors with the listed logins from the output file
-   **commitType** - Excludes commits with the listed types from the output file
-   **commitScope** - Excludes commits with the listed scopes from the output file
-   **commitSubject** - Excludes commits that contain the specified words in the subject

## Plugins

Plugins that extend the basic functionality and modify the output in the change log. All plugin settings are described in the special section `plugins` of the configuration as follows:

```YAML
plugins:
    <plugin name>:
        <plugins option>
        ...
        <plugins option>
```

For the correct configuration of plugins read the section [Plugins](plugins/plugins.md)
