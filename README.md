<p align="center"><img src="https://cdn.jsdelivr.net/gh/tagproject/art/packages/changelog-guru/banner.svg" alt="Package logo"></p>

<p align="center">
    <a href="https://github.com/keindev/changelog-guru/actions"><img src="https://github.com/keindev/changelog-guru/actions/workflows/build.yml/badge.svg" alt="Build Status"></a>
    <a href="https://codecov.io/gh/keindev/changelog-guru"><img src="https://codecov.io/gh/keindev/changelog-guru/branch/master/graph/badge.svg" /></a>
    <a href="https://www.npmjs.com/package/changelog-guru"><img alt="npm" src="https://img.shields.io/npm/v/changelog-guru.svg"></a>
    <a href="https://github.com/tagproject/ts-package-shared-config"><img src="https://img.shields.io/badge/standard--shared--config-nodejs%2Bts-green?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAfCAYAAACh+E5kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJQSURBVHgB1VftUcMwDFU4/tMNyAZ0A7IBbBA2CExAmIBjApcJChO0TFA2SJkgMIGRyDNV3TSt26RN353OX/LHUyTZIdoB1tqMZcaS0imBDzxkeWaJWR51SX0HrJ6pdsJyifpdb4loq3v9A+1CaBuWMR0Q502DzuJRFD34Y9z3DXIRNy/QPWKZY27COlM6BtZZHWMJ3CkVa28KZMTJkDpCVLOhs/oL2gMuEhYpxeenPPah9EdczLkvpwZgnQHWnlNLiNQGYiWx5gu6Ehz4m+WNN/2i9Yd75CJmeRDXogbIFxECrqQ2wIvlLBOXaViuYbGQNSQLFSGZyOnulb2wadaGnyoSSeC8GBJkNDf5kloESAhy2gFIIPG2+ufUMtivn/gAEi+Gy4u6FLxh/qer8/xbLq7QlNh6X4mbtr+A3pylDI0Lb43YrmLmXP5v3a4I4ABDRSI4xjB/ghveoj4BCVm37JQADhGDgOA+YJ48TSaoOwKpt27aOQG1WRES3La65WPU3dysTjE8de0Aj8SsKS5sdS9lqCeYI08bU6d8EALYS5OoDW4c3qi2gf7f+4yODfj2DIcqdVzYKnMtEUO7RP2gT/W1AImxXSC3i7R7rfRuMT5G2xzSYzaCDzOyyzDeuNHZx1a3fOdJJwh28fRwwT1QY6Xzf7TvWG6ob/BIGPQ59ymUngRyRn2El6Fy5T7G0zl+JmoC3KRQXyT1xpfiJKIeAemzqBl6U3V5ocZNf4hHg61u223wn4nOqF8IzvF9IxCMkyfQ+i/lnnhlmW6h9+Mqv1SmQhehji4JAAAAAElFTkSuQmCC" alt="Standard Shared Config"></a>
</p>

Automated changelog generator:package::zap::clipboard:

**changelog-guru** generate a [CHANGELOG.md](CHANGELOG.md) from git metadata and checks if your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/).

## Install

```console
npm install changelog-guru --save-dev
```

## Goals

- allow generating [CHANGELOG.md](CHANGELOG.md) by script
- allow ignoring commits
- provide better information when browsing the history

## Format of the commit message

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

## Getting started

Changelog-guru can be used either through a command line interface with an optional configuration file, or else through its JavaScript API. Run `changelog --help` to see the available options and parameters.

### Configuration

Only the minimum necessary settings are described here, for more detailed configuration, see the [default](https://github.com/keindev/changelog-guru/blob/master/.changelogrc.default.yml) configuration file.

> Changelog-guru uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) and you can configure the module in any way you like described in the documentation.

### Provider

The type of service provider to receive information about the project. To set the type of service you want to use, you must:

- Set `provider: github` or `provider: gitlab` in your configuration file, it's all.
- Make sure the provider token is available as an environment variable.

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

- `--bump` - Bumps package version in package.json if specified
- `--branch <value>` - Sets the branch by which the change log will be generated
- `--provider <value>` - Specifies the type of service provider to receive project information
- `--output <value>` - File path to write change log to it

### Lint commit message

There is a `changelog lint` for checking the spelling of the commit message. Checks compliance with the format and spelling in the subject of the commit.

```

changelog lint --message "..."

```

To lint commits before they are created you can use Husky's (v5.x) `commit-msg` hook:

```console
changelog lint --message $1
```

For a more meticulous check, the following options are available:

- `--message <text>` - Required. Commit message for linting
- `--maxLength number` - Max commit header length

## API

Read the [API documentation](docs/api/index.md) for more information.
