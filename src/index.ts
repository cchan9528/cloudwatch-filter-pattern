const IS_NON_ALPHANUMERIC_PATTERN: RegExp = new RegExp(/\W/);
const IS_ENCLOSED_IN_DOUBLE_QUOTES: RegExp = new RegExp(/^".*"$/);
const IS_ONLY_WHITESPACE: RegExp = new RegExp(/^\s*$/);

function cwlogContains(cwlog: string, pattern: string): boolean {
  if (IS_ENCLOSED_IN_DOUBLE_QUOTES.test(pattern)) {
    pattern = pattern.slice(1, -1);
    if (IS_ONLY_WHITESPACE.test(pattern)) {
      return true;
    }
  } else if (IS_NON_ALPHANUMERIC_PATTERN.test(pattern)) {
    return false;
  }
  return cwlog.includes(pattern);
}

function getFilterPatterns(filter: string): Array<string> {
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

export function isCloudwatchLogFilterMatch(
  cwlog: string,
  filter: string
): boolean {
  let numMatches : number = 0;
  for (const pattern of getFilterPatterns(filter)) {
    if (pattern[0] === '?') {
      if (cwlogContains(cwlog, pattern.slice(1))) {
        return true;
      }
    } else if (pattern[0] === '-') {
      if (cwlogContains(cwlog, pattern.slice(1))) {
        return false;
      }
    } else {
      if (!cwlogContains(cwlog, pattern)) {
        return false;
      }
      numMatches += 1;
    }
  }
  return numMatches > 0;
}
