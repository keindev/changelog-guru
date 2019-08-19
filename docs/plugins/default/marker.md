# Marker plugin

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

## Actions

Action markers performs operations on commits objects when building a changelog:

-   `!ignore` - ignore a commit in output
-   `!group(<name>)` - creates a group of commits with the `<name>`

## Joins

Join markers combine commits in sections. Configured as follows:

```
<marker name>: <section title>
```

The following markers are available:

-   `!important` - Place a commit title to special section on top of changelog
-   `!deprecated` - Place a commit title to special section with deprecated properties
-   `!break` - Indicates major changes breaking backward compatibility
