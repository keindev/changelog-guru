export const splitHeadline = (text: string): [string, string, string] => {
  const match = text.match(/^(?<type>[ a-z]+) {0,1}(\((?<scope>[\d &,:a-z-]+)\)){0,1}(?=:):(?<subject>[\S ]+)/i);
  let type = '';
  let scope = '';
  let subject = '';

  if (match) {
    const { groups } = match;

    if (groups) {
      if (groups.type) type = groups.type.trim();
      if (groups.scope) scope = groups.scope.trim();
      if (groups.subject) subject = groups.subject.trim();
    }
  }

  return [type, scope, subject];
};
