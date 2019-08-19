# Scope plugin

Base plugin enabled by default. Renames scopes and abbreviations to a more human-readable format.

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

## onlyPresented

Default: `false`

In the case of true will only rename the specified names.

## names

List of abbreviations and their human-readable versions. Configured as follows:

```
<abbreviated name>: <human-readable name>
```
