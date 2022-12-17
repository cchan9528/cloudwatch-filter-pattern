const NON_ALPHANUMERIC_TERM: RegExp = new RegExp('\W');
const ENCLOSED_IN_DOUBLE_QUOTES: RegExp = new RegExp('^".*"$');

function isValidPattern(pattern: string) {
  return (
    ENCLOSED_IN_DOUBLE_QUOTES.test(pattern) ||
    !NON_ALPHANUMERIC_TERM.test(pattern)
  );
}

function getFilterPatterns(filter: string) {
  const patterns : Array<string> = [];

  const tokens : Array<string> = filter.split(/(\s)+/);
  let i : number = 0;
  while (i < tokens.length){
    let pattern : string = tokens[i];
    if (tokens[i][0] === '"') {
      pattern = '';
      while (tokens[i].slice(-1) !== '"') {
        pattern += tokens[i];
        i += 1;
      }
      pattern += tokens[i];
      i += 1;
    }
    patterns.push(pattern);
    i += 1;
  }

  return patterns;
}

export function isCloudwatchLogFilterMatch(cwlog: string, filter: string) {
  const patterns: Array<string> = getFilterPatterns(filter);
  for (const pattern of patterns) {
    if (!isValidPattern(pattern) || !cwlog.includes(pattern)) {
      return false;
    }
  }
  return true;
}
