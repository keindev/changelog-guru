export enum MarkerType {
    // !break - indicates major changes breaking backward compatibility
    Breaking = 'break',
    // !deprecate- place a commit title to special section with deprecated properties
    Deprecated = 'deprecated',
    // !group(NAME) - creates a group of commits with the <NAME>
    Grouped = 'group',
    // !ignore - ignore a commit in output
    Ignore = 'ignore',
    // !important - place a commit title to special section on top of changelog
    Important = 'important',
}
