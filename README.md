<p align="center"><img width="600" src="https://cdn.jsdelivr.net/gh/keindev/changelog-guru/media/logo.svg" alt="Changelog-guru logo"></p>

<p align="center">
    <a href="https://travis-ci.org/keindev/changelog-guru"><img src="https://travis-ci.org/keindev/changelog-guru.svg?branch=master" alt="Build Status"></a>
    <a href="https://codecov.io/gh/keindev/changelog-guru"><img src="https://codecov.io/gh/keindev/changelog-guru/branch/master/graph/badge.svg" /></a>
    <a href="https://www.npmjs.com/package/changelog-guru"><img alt="npm" src="https://img.shields.io/npm/v/changelog-guru.svg"></a>
    <a href="https://www.npmjs.com/package/changelog-guru"><img alt="NPM" src="https://img.shields.io/npm/l/changelog-guru.svg"></a>
    <a href="https://snyk.io/test/github/keindev/changelog-guru?targetFile=package.json"><img src="https://snyk.io/test/github/keindev/changelog-guru/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/keindev/changelog-guru?targetFile=package.json" style="max-width:100%;"></a>
</p>

Automated changelog generator:package::zap::clipboard:

> Absolutely [customizable](#configuration) a release changelog with helpful [plugins](#plugins)

## Install

### Yarn

```console
yarn add changelog-guru
```

### NPM

```console
npm install changelog-guru
```

## Usage

Changelog-guru can be used either through a command line interface with an optional configuration file, or else through its JavaScript API. Run `changelog --help` to see the available options and parameters.

Create `CHANGELOG.md`:

```

changelog [options]

```

### Goals

-   allow generating `CHANGELOG.md` by script
-   allow ignoring commits
-   provide better information when browsing the history

### Format of the commit message

```
<type>(<scope>): <subject>
<markers>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

#### Type

The type of [changes](#levels-of-changes) made by this commit, such as `feat` or `fix`.

#### Scope

Scope could be anything specifying place of the commit change.

#### Subject

> Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on github as well as in various git tools.

Subject line contains succinct description of the change.

#### Markers

> See the [Marker plugin](#marker) section for a more detailed description.

Control markers of the form `!<name>`, allow you to group, ignore or increase the priority of commits in the change log

#### Body & Footer

All that allows you to write a conscience.

## Configuration

> Changelog-guru uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) and you can configure the module in any way you like described in the documentation.

All options can be configured in the configuration file, this is where `changelog-guru` looks for configuration:

-   `.changelogrc` file in JSON or YAML format
-   `.changelogrc.json` file
-   `.changelogrc.yaml`, `.changelogrc.yml`, or `.changelogrc.js` file
-   `changelog` property in `package.json`
-   `changelog.config.js` file exporting a JS object

For example see [.changelogrc.yaml](.changelogrc.yaml). Also you can use `changelog-guru` with [default](.changelogrc.default.yaml) configuration.

### Provider

| Default  | CLI Override          | API Override         |
| -------- | --------------------- | -------------------- |
| `github` | `--provider <string>` | `provider: <string>` |

The type of service provider to receive information about the project. To set the type of service you want to use, you must:

-   Set `provider: github` or `provider: gitlab` in your configuration file, it's all.
-   Make sure the provider token is available as an environment variable.

Example:

```
export GITHUB_TOKEN="f941e0..."

export GITLAB_TOKEN="f941e0..."
```

> Changelog-guru uses [dotenv](https://www.npmjs.com/package/dotenv) and you can loads environment variables from a `.env`

### Levels of changes

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

### Output options

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

#### filePath

File path to write change log to it.

| Default        | CLI Override      | API Override       |
| -------------- | ----------------- | ------------------ |
| `CHANGELOG.md` | `--output <path>` | `filePath: string` |

#### exclude

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

### Other CLI options

| Default | CLI             | Description                                                                                                                                      |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `false` | `--bump`        | Based on data about changes made in the project, forms the next version number and bumps it in `package.json`, see [SemVer](https://semver.org/) |
| -       | `-v, --version` | Show `changelog-guru` package version                                                                                                            |
| -       | `--help`        | Show `changelog-guru` cli options help                                                                                                           |

### Plugins

All plugin settings are described in the special section `plugins` of the configuration as follows:

```YAML
plugins:
    <plugin name>:
        <plugins option>
        ...
        <plugins option>
```

#### Attention

Base plugin enabled by default. Displays information about changes to [package.json](https://docs.npmjs.com/files/package.json) in the change log. Checks the following sections:

-   [license](https://docs.npmjs.com/files/package.json#license)
-   [engines](https://docs.npmjs.com/files/package.json#engines)
-   [dependencies](https://docs.npmjs.com/files/package.json#dependencies)
-   [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)
-   [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)
-   [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)

Default options:

```YAML
attention:
    title: Important Changes
    templates:
        added: 'Added %name% with %val%'
        changed: 'Changed %name% from %pval% to %val%'
        bumped: 'Bumped %name% from %pver% to %ver%'
        downgraded: 'Downgraded %name% from %pver% to %ver%'
        removed: 'Removed %name%, with %pval%'
    sections:
        license: License
        engines: Engines
        dependencies: Dependencies
        devDependencies: DevDependencies
        peerDependencies: PeerDependencies
        optionalDependencies: OptionalDependencies,
```

##### Title

Default: `Important Changes`

The name of the main section in which all other sections will be placed with changes by types.

##### Templates

The change message templates:

-   **added** - added Dependencies
-   **changed** - dependencies whose value is not `SemVer` and has been changed
-   **bumped** - dependencies whose version was bumped
-   **downgraded** - dependencies whose version was downgraded
-   **removed** - removed dependencies

Literals available for substitution in Templates:

-   `%name%` - dependency name
-   `%ver%` - semantic version of dependency, for example `1.9.3`
-   `%pver%` - previous semantic version of dependency
-   `%val%` - dependency version, for example `^1.9.3`
-   `%pval%` - previous dependency version

##### Sections

Section names with dependency changes.

#### Marker

Base plugin enabled by default. Allows you to add additional useful information to the commit, for example, about breaking changes. Or allows you to hide the commit from the change log.

Two types of markers are available, action markers and join markers.

Default options:

```YAML
marker:
    actions:
        - ignore
        - group
    joins:
        important: Important Internal Changes
        deprecated: DEPRECATIONS
        break: BREAKING CHANGES
```

##### Actions

Action markers performs operations on commits when building a change log:

-   `!ignore` - ignore a commit in output
-   `!group(<name>)` - creates a group of commits with the `<name>`

##### Joins

Join markers combine commits in sections. Configured as follows:

```
<marker name>: <section title>
```

The following markers are available:

-   `!important` - place a commit title to special section on top of changelog
-   `!deprecated` - place a commit title to special section with deprecated properties
-   `!break` - indicates major changes breaking backward compatibility

#### Scope

Base plugin enabled by default. Renames areas and abbreviations to a more human-readable format.

Default options:

```YAML
scope:
    onlyPresented: false
    names:
        cr: Core
        api: API
        ssr: Server Side Rendering
        fc: Functional Components
        dts: TypeScript Declaration Improvements
```

##### onlyPresented

Default: `false`

In the case of true will only rename the specified names.

##### names

List of abbreviations and their human-readable versions. Configured as follows:

```
<abbreviated name>: <human-readable name>
```

#### Section

Base plugin enabled by default. Distributes commits with the specified types into sections. Configured as follows:

```
<section name>: [commit types]
```

Default options:

```YAML
section:
    Features: [feat]
    Improvements: [improve]
    Bug Fixes: [fix]
    Internal changes: [types, workflow, build, test, chore, docs]
    Performance Improvements: [perf]
    Code Refactoring: [refactor]
    Reverts: [revert]
```

## License

[MIT](LICENSE)
