# changelog-guru

## Table of contents

### References

- [default](index.md#default)

### Classes

- [Changelog](classes/changelog.md)

### Type aliases

- [IBuildOptions](index.md#ibuildoptions)
- [ILintOptions](index.md#ilintoptions)

## References

### default

Renames and exports: [Changelog](classes/changelog.md)

## Type aliases

### IBuildOptions

Ƭ **IBuildOptions**: *object*

#### Type declaration:

| Name | Type | Description |
| :------ | :------ | :------ |
| `branch?` | *string* | Sets the branch by which the change log will be generated |
| `bump?` | *boolean* | Bumps package version in package.json if specified |
| `output?` | *string* | Output file path |
| `provider?` | GitServiceProvider | Specifies the type of service provider to receive project information |

___

### ILintOptions

Ƭ **ILintOptions**: *object*

#### Type declaration:

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxLength?` | *number* | Max commit header length |
| `message?` | *string* | Commit message for linting |
