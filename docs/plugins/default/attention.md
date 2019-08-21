# Attention plugin

Base plugin enabled by default. Displays information about changes to [package.json](https://docs.npmjs.com/files/package.json) in the change log. Checks the following sections:

-   [license](https://docs.npmjs.com/files/package.json#license)
-   [engines](https://docs.npmjs.com/files/package.json#engines)
-   [dependencies](https://docs.npmjs.com/files/package.json#dependencies)
-   [dev dependencies](https://docs.npmjs.com/files/package.json#devdependencies)
-   [peer dependencies](https://docs.npmjs.com/files/package.json#peerdependencies)
-   [optional dependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)
-   [bundled dependencies](https://docs.npmjs.com/files/package.json#bundleddependencies)
-   [OS](https://docs.npmjs.com/files/package.json#os)
-   [CPU](https://docs.npmjs.com/files/package.json#cpu)

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
        - license
        - os
        - cpu
        - engines
        - dependencies
        - devDependencies
        - peerDependencies
        - optionalDependencies
        - bundledDependencies
```

## Title

Default: `Important Changes`

The name of the main section in which all other sections will be placed with changes by types.

## Templates

The change message templates:

-   **added** - Template for added Dependencies
-   **changed** - Template for dependencies whose values is not `SemVer` and has been changed
-   **bumped** - Template for dependencies whose version was bumped
-   **downgraded** - Template for dependencies whose version was downgraded
-   **removed** - Template for removed dependencies

Literals available for substitution in Templates:

-   `%name%` - dependency name
-   `%ver%` - semantic version of dependency, for example `1.9.3`
-   `%pver%` - previous semantic version of dependency
-   `%val%` - dependency version, for example `^1.9.3`
-   `%pval%` - previous dependency version

## Sections

List of available for output sections. If you do not want to see a section in the change log, simply remove its name from the list.
