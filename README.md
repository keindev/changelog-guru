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

## Contents

-   [What is **changelog-guru**](#what-is-changelog-guru)
-   [Getting started](#getting-started)
    -   [Configuration](#configuration)
    -   [Generate changelog](#generate-changelog)
    -   [Lint commit message](#lint-commit-message)

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

The type of [changes](#levels-of-changes) made by this commit, such as `feat` or `fix`.

#### Scope

Scope could be anything specifying place of the commit change.

#### Subject

> Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on github as well as in various git tools.

Subject line contains succinct description of the change.

#### Markers

> See the [Marker plugin](#marker) section for a more detailed description.

Control markers of the form `!<name>`, allow you to group, ignore or increase the priority of commits in the change log.

#### Body & Footer

Extended information about changes.

## Getting started

Changelog-guru can be used either through a command line interface with an optional configuration file, or else through its JavaScript API. Run `changelog --help` to see the available options and parameters.

### Configuration

> Changelog-guru uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) and you can configure the module in any way you like described in the documentation.

All options can be configured in the configuration file, this is where `changelog-guru` looks for configuration:

-   `.changelogrc` file in JSON or YAML format
-   `.changelogrc.json` file
-   `.changelogrc.yaml`, `.changelogrc.yml`, or `.changelogrc.js` file
-   `changelog` property in `package.json`
-   `changelog.config.js` file exporting a JS object

For example see [.changelogrc.yaml](.changelogrc.yaml). Also you can use `changelog-guru` with [default](.changelogrc.default.yaml) configuration.

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

```

changelog generate [options]

```

### Lint commit message

```

changelog lint [options]

```

## License

[MIT](LICENSE)
