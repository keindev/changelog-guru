# Section plugin

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

Configured as follows:

```
<human-readable section name>: [types]
```
