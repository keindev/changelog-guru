# Changelog

Changelog manger

## Methods

### generate

Generate changelog file

#### Parameters

| Name               | Type                              | Description                                                           |
| :----------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| `options.branch`   | _string \| undefined_             | Sets the branch by which the change log will be generated             |
| `options.bump`     | _boolean \| undefined_            | Bumps package version in package.json if specified                    |
| `options.output`   | _string \| undefined_             | Output file path                                                      |
| `options.provider` | _GitServiceProvider \| undefined_ | Specifies the type of service provider to receive project information |

### lint

Lint commit message

#### Parameters

| Name                 | Type                  | Description                |
| :------------------- | :-------------------- | :------------------------- |
| `options.maxLength?` | _number \| undefined_ | Max commit header length   |
| `options.message?`   | _string \| undefined_ | Commit message for linting |
