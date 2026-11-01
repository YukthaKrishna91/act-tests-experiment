export function formatHelp(info, options, details) {
  const { name, description, positionals } = info;

  return [
    `Usage: ${name} ${positionals ?? ''} ${options ? '[options]' : ''}`,
    '',
    `${description}`,
    '',
    '## Options',
    '',
    ...Object.entries(options).flatMap(
      ([longName, { default: defaultValue, short: shortName }]) => {
        const namePart = shortName ? `-${shortName}, --${longName}` : `--${longName}`;
        const summaryPart = details[longName].summary;
        const defaultPart = defaultValue == null ? '' : `(default: ${defaultValue})`;

        return [`${namePart}:`, `    ${summaryPart} ${defaultPart}`];
      }
    ),
    '',
    ''
  ].join('\n');
}
