# Highlight plugin

Base plugin enabled by default. Highlights variables and code snippets in subject of commit. 

Default options:

```YAML

camelCase: true
masks: []

```

## camelCase

Default: `true`

Highlights a word or abbreviation written in camelCase.

## masks

List of custom regular expressions for extra highlighting. Configured as follows:

```
masks: ['#\\S*']
```