import {describe, expect, test} from '@jest/globals';
import {isCloudwatchLogFilterMatch} from "src/index";

describe('Using filter patterns to match terms in log events', () => {
  test('Filter patterns are case sensitive', () => {
    expect(isCloudwatchLogFilterMatch('Cloudwatch', 'Cloudwatch')).toBeTruthy();
    expect(isCloudwatchLogFilterMatch('Cloudwatch', 'cloudwatch')).toBeFalsy();
  });
  test('Enclose exact phrases and terms that include non-alphanumeric characters in double quotation marks ("")', () => {
    expect(isCloudwatchLogFilterMatch('Cloud logs watch', 'Cloud watch')).toBeTruthy();
    expect(isCloudwatchLogFilterMatch('Cloud logs watch', '"Cloud watch"')).toBeFalsy();
    expect(isCloudwatchLogFilterMatch('Cloud watch logs', '"Cloud watch"')).toBeTruthy();
    expect(isCloudwatchLogFilterMatch('Cloud watch logs', 'Cloud watch')).toBeTruthy();

    // TODO: Verify what happens when non-alphanumeric is not in double quotes
    expect(isCloudwatchLogFilterMatch('#Cloud watch', '#Cloud')).toBeFalsy();
    expect(isCloudwatchLogFilterMatch('#Cloud watch', '"#cloud"')).toBeFalsy();
    expect(isCloudwatchLogFilterMatch('#Cloud watch', '"#Cloud"')).toBeTruthy();

    // TODO: Verify: Does cloudwatch support multiple phrases like '"cloudwatch logs" "@example"' ? 
    expect(isCloudwatchLogFilterMatch('#Cloud #watch', '"#Cloud" #watch')).toBeFalsy();
    expect(isCloudwatchLogFilterMatch('#Cloud #watch', '"#Cloud" "#watch"')).toBeTruthy();
  });
  test('Match a single term', () => {
    [
      '[ERROR 400] BAD REQUEST',
      '[ERROR 401] UNAUTHORIZED REQUEST',
      '[ERROR 419] MISSING ARGUMENTS',
      '[ERROR 420] INVALID ARGUMENTS',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, 'ERROR')).toBeTruthy();
    });
  });
  test('Match multiple terms', () => {
    [
      '[ERROR 419] MISSING ARGUMENTS',
      '[ERROR 420] INVALID ARGUMENTS',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, 'ERROR ARGUMENTS')).toBeTruthy();
    });

    [
      '[ERROR 400] BAD REQUEST',
      '[ERROR 401] UNAUTHORIZED REQUEST',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, 'ERROR ARGUMENTS')).toBeFalsy();
    });
  });

  test('Match single and multiple terms', () => {
    [
      '[ERROR 400] BAD REQUEST',
      '[ERROR 401] UNAUTHORIZED REQUEST',
      '[ERROR 419] MISSING ARGUMENTS',
      '[ERROR 420] INVALID ARGUMENTS',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, '?ERROR ?ARGUMENTS')).toBeTruthy();
    });

    // TODO: verify false if doesn't have **at least one** term
    expect(isCloudwatchLogFilterMatch('false', '?ERROR ?ARGUMENTS')).toBeFalsy();
  });
});


// describe('Using metric filters to match terms and extract values from JSON log events', () => {});
// describe('Using metric filters to extract values from space-delimited log events', () => {});
// describe('Configuring metric values for a metric filter', () => {});
// describe('Publishing dimensions with metrics from values in JSON or space-delimited log events', () => {});
// describe("Using values in log events to increment a metric's value", () => {});
