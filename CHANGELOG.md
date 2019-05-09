## Features
### Logging
- Added base logging system a task & statuses
- Rethought class "Process"
- Changes in the process of logging task states
- Added task loging to Providers & conf readers
- Added information methods to Task, fix some bugs with display tree
### Debug mode
- Added debug loging for State & Reader
- Added debug loging for IO, Entities & Middleware
- Added Entity class for better debug
### Subsections & Groups
- **[Section]** Added new SectionBlock type - Group
### Others
- **[Plugins]** Added Sign plugin
- **[Plugins]** Added Sign plugin parse method
- **[Plugins]** Added Sing plugin modify method
- Add repo state reader
- Rewrite to typescript
- Add author & commit entities
- Adding plugin logic, configuration file changes
- Added plugins
- Rework Reader & State
- Added Plugins  call for handling Сommits
- Added Scope & Section plugins
- Added Section block & position enums
- Added Section & Commit managers
- Reworked plugins, added a Levenshtein distance compare algorithm
- Add sections tree & commit list render
## Bug Fixes
- **[Section,State]** Add commit tree generation method
- **[State]** Added section list sorting after modify with plugins
- Rewrite reader, test github api
- Rewrite reader, test github api
- Add author avatar size
- Added missing Commit type
- Fixed commit parsing
- Fixed regular expressions
- Fixed parsing & modify commits
- Spinner rotation bug fixed
- Add version information from package and last release
- Pkg version management
- Add writer, fix state tree
## Internal сhanges
- **[Author]** Сhanged the size parameter modification method
- Add .editorconfig & dependencies
- Work on commit message template struct
- Fix path to src in lint command
- Added VS settings, fix configs, update dependencies
- Added husky dependence
- Added "cd" type
- Removed husky cfg from pkg
- Added debug command, added prettier, update dependencies
- Added debug config for vsc
- Changed husky hooks
## Code Refactoring
### Refactoring
- Reworked plugins, fix some a linter errors
- Ended last part of global refactoring
### Pkg refactoring
- Reworked changelog building process
### Others
- Rework reader structure, add git & cli classes
- Add linter, begin fix lint errors
- Lint free code, rework classes model
- Rebuild src struct, configure ts transpile
- Completed the transition to the TS
- Change config file struct
- Fix lint & tsc errors
- Change Scope & Section plugins creation
- Changed plugins process flow