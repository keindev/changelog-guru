# Highlight plugin

Base plugin enabled by default. Highlights code in subject of commit. 

Default options:

```YAML

camelCase: true
masks: []

```

## camelCase

Default: `true`

In the case of false won't highlight camel case code.

## masks

List of regular expressions. Configured as follows:

```
masks: ['#\\S*']
```