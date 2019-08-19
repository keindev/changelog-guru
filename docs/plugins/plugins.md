# Plugins

Plugins that extend the basic functionality and modify the output in the change log. All plugin settings are described in the special section `plugins` of the configuration as follows:

```YAML
plugins:
    <plugin name>:
        <plugins option>
        ...
        <plugins option>
```

To enable the plugin, you need to specify its name in the list of `plugins` and set the necessary option values:

```
    marker:
        actions:
            - ignore
            ...
        joins:
            important: Important Internal Changes
            ...
```

## Default plugins

These plugins are enabled by default and provide basic functionality.

### [Attention plugin](default/attention.md)

Displays information about changes to [package.json](https://docs.npmjs.com/files/package.json) in the change log.

### [Marker plugin](default/marker.md)

Allows you to add additional useful information to the commit, for example, about breaking changes. Or allows you to hide the commit from the change log.

### [Scope plugin](default/scope.md)

Renames scopes and abbreviations to a more human-readable format.

### [Section plugin](default/section.md)

Distributes commits with the specified types into sections.
