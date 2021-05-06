# Class: Changelog

Changelog manger

## Table of contents

### Constructors

- [constructor](changelog.md#constructor)

### Methods

- [generate](changelog.md#generate)
- [lint](changelog.md#lint)

## Constructors

### constructor

\+ **new Changelog**(): [*Changelog*](changelog.md)

**Returns:** [*Changelog*](changelog.md)

## Methods

### generate

▸ **generate**(`options?`: [*IBuildOptions*](../index.md#ibuildoptions)): *Promise*<void\>

Generate changelog file

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [*IBuildOptions*](../index.md#ibuildoptions) |

**Returns:** *Promise*<void\>

___

### lint

▸ **lint**(`options?`: [*ILintOptions*](../index.md#ilintoptions)): *Promise*<void\>

Lint commit message

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [*ILintOptions*](../index.md#ilintoptions) |

**Returns:** *Promise*<void\>
