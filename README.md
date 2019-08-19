<p align="center"><img width="600" src="https://cdn.jsdelivr.net/gh/keindev/changelog-guru/media/logo.svg" alt="Changelog-guru logo"></p>

<p align="center">
    <a href="https://travis-ci.org/keindev/changelog-guru"><img src="https://travis-ci.org/keindev/changelog-guru.svg?branch=master" alt="Build Status"></a>
    <a href="https://codecov.io/gh/keindev/changelog-guru"><img src="https://codecov.io/gh/keindev/changelog-guru/branch/master/graph/badge.svg" /></a>
    <a href="https://www.npmjs.com/package/changelog-guru"><img alt="npm" src="https://img.shields.io/npm/v/changelog-guru.svg"></a>
    <a href="https://www.npmjs.com/package/changelog-guru"><img alt="NPM" src="https://img.shields.io/npm/l/changelog-guru.svg"></a>
    <a href="https://snyk.io/test/github/keindev/changelog-guru?targetFile=package.json"><img src="https://snyk.io/test/github/keindev/changelog-guru/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/keindev/changelog-guru?targetFile=package.json" style="max-width:100%;"></a>
</p>

Automated changelog generator:package::zap::clipboard:

> Absolutely [customizable](#configuration) a release changelog with helpful [plugins](docs/plugins/plugins.md)

## Install

### Yarn

```console
yarn add changelog-guru
```

### NPM

```console
npm install changelog-guru
```

## Contents

-   [What is **changelog-guru**](#what-is-changelog-guru)
-   [Getting started](#getting-started)
    -   [Configuration](#configuration)
    -   [Generate changelog](#generate-changelog)
    -   [Lint commit message](#lint-commit-message)
-   [Plugins](docs/plugins/plugins.md)

### What is **changelog-guru**

changelog-guru generate a CHANGELOG from git metadata and checks if your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/).

### Goals

-   allow generating `CHANGELOG.md` by script
-   allow ignoring commits
-   provide better information when browsing the history

### Format of the commit message

The commit message pattern mostly looks like this:

```
<type>(<scope>): <subject>
<markers>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Real world examples can look like this:

```
fix(Section): fix sections sorting
!break

Sort direction added:
... code example
```

```
build(deps-dev): bump eslint-plugin-jest to 22.x
```

```
refactor(State): tidy up work with message queues
!group(Prerelease refactoring)

...

refactor(ConfigLoader): correct configuration loading method
!group(Prerelease refactoring)
```

#### Type

The type of changes made by this commit, such as `feat` or `fix`. You can configure you own types in [config](docs/configuration.md) file.

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
    -   `build` - Package changes, release
    -   `types` - Code typing
    -   `style` - `CSS`, `SCSS`, and other style sheets changes
    -   `workflow` - Workflow changes
    -   `perf` - Performance improvements
    -   `revert` - Reverted changes

#### Scope

Scope could be anything specifying place of the commit changes. You can configure you own scopes in [config](docs/plugins/default/scope.md) file.

#### Subject

> Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on github as well as in various git tools.

Subject line contains succinct description of the change.

#### Markers

> See the [Marker plugin](docs/plugins/default/marker.md) section for a more detailed description.

Control markers of the form `!<name>`, allow you to group, ignore or increase the priority of commits in the change log.

#### Body and Footer

Extended information about changes.

## Getting started

Changelog-guru can be used either through a command line interface with an optional configuration file, or else through its JavaScript API. Run `changelog --help` to see the available options and parameters.

### Configuration

Only the minimum necessary settings are described here, for more detailed configuration, read the section [Configuration](docs/configuration.md).

> Changelog-guru uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) and you can configure the module in any way you like described in the documentation.

All options can be configured in the configuration file, this is where `changelog-guru` looks for configuration:

-   `.changelogrc` file in JSON or YAML format
-   `.changelogrc.json` file
-   `.changelogrc.yaml`, `.changelogrc.yml`, or `.changelogrc.js` file
-   `changelog` property in `package.json`
-   `changelog.config.js` file exporting a JS object

For example see [.changelogrc.yaml](.changelogrc.yaml). Also you can use `changelog-guru` with [default](.changelogrc.default.yaml) configuration.

Read more about [configuration file](docs/configuration.md)

#### Provider

The type of service provider to receive information about the project. To set the type of service you want to use, you must:

-   Set `provider: github` or `provider: gitlab` in your configuration file, it's all.
-   Make sure the provider token is available as an environment variable.

Example:

```
export GITHUB_TOKEN="f941e0..."

export GITLAB_TOKEN="f941e0..."
```

> Changelog-guru uses [dotenv](https://www.npmjs.com/package/dotenv) and you can loads environment variables from a `.env`

### Generate changelog

Generate a changelog file by git metadata.

```

changelog generate [options]

```

The command can be executed without options. If necessary, or if you want to override the options specified in the configuration file, you can specify the following options:

-   `--bump` - Bumps package version in package.json if specified
-   `--branch <value>` - Sets the branch by which the change log will be generated
-   `--provider <value>` - Specifies the type of service provider to receive project information
-   `--output <value>` - File path to write change log to it
-   `--major [types]` - The commit types with incompatible API changes
-   `--minor [types]` - The commit types with backwards-compatible and added functionality
-   `--patch [types]` - The commit types with backwards-compatible and bug fixes
-   `--excl-authors [logins]` - Excludes authors with the listed logins from output
-   `--excl-types [types]` - Excludes commits with the listed types from output
-   `--excl-scopes [scopes]` - Excludes commits with the listed scopes from output
-   `--excl-subjects [words]` - Excludes commits that contain the specified words in the subject

### Lint commit message

There is a `changelog lint` for checking the spelling of the commit message. Checks compliance with the format and spelling in the subject of the commit.

```

changelog lint --message "..."

```

To lint commits before they are created you can use Husky's 'commit-msg' hook:

```json
{
    "husky": {
        "hooks": {
            "commit-msg": "changelog lint --message HUSKY_GIT_PARAMS"
        }
    }
}
```

For a more meticulous check, the following options are available:

-   `--message <text>` - Required. Commit message for linting
-   `--length number` - Max commit header length
-   `--lowercase-only boolean` - Uses only lowercase types

## License

[MIT](LICENSE)
