# Important Changes

## Engines

- Changed **node** from `>=14.0.0` to `^14.13.1 || >=16.0.0`

## Dependencies

<details>
<summary>Dependencies</summary>

- Added **[package-json-helper](https://www.npmjs.com/package/package-json-helper)** with `^4.0.0`
- Changed **[cosmiconfig](https://www.npmjs.com/package/cosmiconfig)** from `^7.0.0` to `^7.0.1`
- Changed **[yargs](https://www.npmjs.com/package/yargs)** from `^17.0.1` to `^17.3.1`
- Bumped **[dotenv](https://www.npmjs.com/package/dotenv)** from `^9.0.0` to `^10.0.0`
- Bumped **[findup-sync](https://www.npmjs.com/package/findup-sync)** from `^4.0.0` to `^5.0.0`
- Bumped **[gh-gql](https://www.npmjs.com/package/gh-gql)** from `^2.0.1` to `^3.0.3`
- Bumped **[string-lookup-manager](https://www.npmjs.com/package/string-lookup-manager)** from `^2.0.1` to `^3.0.1`
- Bumped **[tasktree-cli](https://www.npmjs.com/package/tasktree-cli)** from `^5.0.1` to `^6.0.0`
- Bumped **[universal-user-agent](https://www.npmjs.com/package/universal-user-agent)** from `^6.0.0` to `^7.0.0`
- Removed **[semver](https://www.npmjs.com/package/semver)**, with `^7.3.5`
- Removed **[write-pkg](https://www.npmjs.com/package/write-pkg)**, with `^4.0.0`

</details>

<details>
<summary>Dev Dependencies</summary>

- Added **[figma-portal](https://www.npmjs.com/package/figma-portal)** with `^0.10.1`
- Changed **[@types/semver](https://www.npmjs.com/package/@types/semver)** from `^7.3.5` to `^7.3.9`
- Changed **[cspell](https://www.npmjs.com/package/cspell)** from `^5.4.0` to `^5.15.1`
- Changed **[eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)** from `^2.22.1` to `^2.25.4`
- Changed **[eslint-plugin-optimize-regex](https://www.npmjs.com/package/eslint-plugin-optimize-regex)** from `^1.2.0` to `^1.2.1`
- Changed **[prettier](https://www.npmjs.com/package/prettier)** from `^2.2.1` to `^2.5.1`
- Changed **[typescript](https://www.npmjs.com/package/typescript)** from `^4.2.4` to `^4.5.4`
- Bumped **[@tagproject/ts-package-shared-config](https://www.npmjs.com/package/@tagproject/ts-package-shared-config)** from `^3.0.0` to `^6.4.0`
- Bumped **[@types/findup-sync](https://www.npmjs.com/package/@types/findup-sync)** from `^2.0.2` to `^4.0.2`
- Bumped **[@types/jest](https://www.npmjs.com/package/@types/jest)** from `^26.0.23` to `^27.4.0`
- Bumped **[@types/node](https://www.npmjs.com/package/@types/node)** from `^15.0.2` to `^17.0.8`
- Bumped **[@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)** from `^4.22.1` to `^5.9.0`
- Bumped **[@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)** from `^4.22.1` to `^5.9.0`
- Bumped **[eslint](https://www.npmjs.com/package/eslint)** from `^7.25.0` to `^8.6.0`
- Bumped **[eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest)** from `^24.3.6` to `^25.3.4`
- Bumped **[eslint-plugin-promise](https://www.npmjs.com/package/eslint-plugin-promise)** from `^5.1.0` to `^6.0.0`
- Bumped **[ghinfo](https://www.npmjs.com/package/ghinfo)** from `^2.0.3` to `^3.0.1`
- Bumped **[husky](https://www.npmjs.com/package/husky)** from `^6.0.0` to `^7.0.4`
- Bumped **[jest](https://www.npmjs.com/package/jest)** from `^26.6.3` to `^27.4.7`
- Bumped **[ts-jest](https://www.npmjs.com/package/ts-jest)** from `^26.5.6` to `^27.1.2`
- Bumped **[ts-node](https://www.npmjs.com/package/ts-node)** from `^9.1.1` to `^10.4.0`
- Removed **[@babel/plugin-transform-runtime](https://www.npmjs.com/package/@babel/plugin-transform-runtime)**, with `^7.13.15`
- Removed **[@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)**, with `^7.14.1`
- Removed **[@types/faker](https://www.npmjs.com/package/@types/faker)**, with `^5.5.4`
- Removed **[@types/yargs](https://www.npmjs.com/package/@types/yargs)**, with `^16.0.1`
- Removed **[babel-jest](https://www.npmjs.com/package/babel-jest)**, with `^26.6.3`
- Removed **[faker](https://www.npmjs.com/package/faker)**, with `^5.5.3`
- Removed **[type-fest](https://www.npmjs.com/package/type-fest)**, with `^1.0.2`
- Removed **[typedoc](https://www.npmjs.com/package/typedoc)**, with `^0.20.36`
- Removed **[typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)**, with `^3.8.0`

</details>

# :fire: Improvements

- Replace default branch name to main [`b08c28c`](https://github.com/keindev/changelog-guru/commit/b08c28c548cd98b672a572feb0ad3a8670a4ad25)

# :bug: Bug Fixes

- Fix default config [`436881f`](https://github.com/keindev/changelog-guru/commit/436881f48b19064f3f0a3f267516d6197dcd129f)
- Fix `TaskTree` output [`9c213a0`](https://github.com/keindev/changelog-guru/commit/9c213a03f891e10a6f70420b454bce63fb760876)
- Mark Engines, CPU or OS changes as major [`a906497`](https://github.com/keindev/changelog-guru/commit/a90649720075598f57dc75aa05e3fc81a324309f)

# :memo: Internal changes

- Remove jest fix [`6605c63`](https://github.com/keindev/changelog-guru/commit/6605c63a3080d31f9093cf32439a64e86a2db6a5)
- Add code_of_conduct and security docs [`b455c6a`](https://github.com/keindev/changelog-guru/commit/b455c6ac7648ad83793a1574a86cf2dd97515f55)
- Fix snapshot [`9a2defc`](https://github.com/keindev/changelog-guru/commit/9a2defcf61a5732d738a55e42e56dfc6510e69ed)
- Fix links, rewrite API doc, extract media files [`5f93333`](https://github.com/keindev/changelog-guru/commit/5f93333182b8e7486457f5edd2de8e8699a81727)

# :wrench: Code Refactoring

- Rewrite package methods to `package-json-helper` [`917e9e2`](https://github.com/keindev/changelog-guru/commit/917e9e2aa089a0c1e91202cd9b89451c66192b81)

---

# Contributors

[![@keindev](https://avatars.githubusercontent.com/u/4527292?v=4&s=40)](https://github.com/keindev)
