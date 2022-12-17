const NON_ALPHANUMERIC_TERM: RegExp = new RegExp(/\W/);
const ENCLOSED_IN_DOUBLE_QUOTES: RegExp = new RegExp(/^".*"$/);

function isValidPattern(pattern: string) {
  return (
    ENCLOSED_IN_DOUBLE_QUOTES.test(pattern) ||
    !NON_ALPHANUMERIC_TERM.test(pattern)
  );
}

function getFilterPatterns(filter: string) {
  const patterns: Array<string> = [];

  let i = 0;
  while (i < filter.length) {
    let pattern : string = '';
    let isPhrase : boolean = false;
    while (i < filter.length && (filter[i] !== ' ' || isPhrase)) {
      pattern += filter[i];
      if (filter[i] === '"') {
        isPhrase = !isPhrase;
      }
      i += 1;
    }

    if (pattern !== '') {
      patterns.push(pattern);
    }
    i += 1;
  }
  
  return patterns;
}

export function isCloudwatchLogFilterMatch(cwlog: string, filter: string) {
  const patterns: Array<string> = getFilterPatterns(filter);
  console.log(patterns);
  for (const pattern of patterns) {
    if (
      !isValidPattern(pattern) ||
      !cwlog.includes(
        ENCLOSED_IN_DOUBLE_QUOTES.test(pattern) ? pattern.slice(1, -1) : pattern
      )
    ) {
      return false;
    }
  }
  return true;
}
