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

    ['hello', '"world"', '"{"'].forEach((filter: string) => {
      expect(
        isCloudwatchLogFilterMatch('{"hello" : "world"}', filter)
      ).toBeTruthy();
    });


    ['{', '"'].forEach((filter: string) => {
      expect(
        isCloudwatchLogFilterMatch('{"hello" : "world"}', filter)
      ).toBeFalsy();
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
      'ARGUMENTS IS THE ONLY KEYWORD IN LOG',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, '?ERROR ?ARGUMENTS')).toBeTruthy();
    });

    // TODO: verify should be false if doesn't have **at least one** term
    expect(isCloudwatchLogFilterMatch('false', '?ERROR ?ARGUMENTS')).toBeFalsy();
  });

  test('Match exact phrases', () => {
    expect(isCloudwatchLogFilterMatch('[ERROR 500] INTERNAL SERVER ERROR', '"INTERNAL SERVER ERROR"')).toBeTruthy();
    expect(isCloudwatchLogFilterMatch('[ERROR 500] INTERNAL SERVER', '"INTERNAL SERVER ERROR"')).toBeFalsy();
  });

  test('Include and exclude terms', () => {
    [
      '[ERROR 400] BAD REQUEST',
      '[ERROR 401] UNAUTHORIZED REQUEST',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, 'ERROR -ARGUMENTS')).toBeTruthy();
    });


    [
      '[ERROR 419] MISSING ARGUMENTS',
      '[ERROR 420] INVALID ARGUMENTS',
    ].forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, 'ERROR -ARGUMENTS')).toBeFalsy();
    });
  })

  test("Match everything", () => {
    const cwlogs: Array<string> = [
      '[ERROR 400] BAD REQUEST',
      '[ERROR 401] UNAUTHORIZED REQUEST',
      '[ERROR 419] MISSING ARGUMENTS',
      '[ERROR 420] INVALID ARGUMENTS',
      'ARGUMENTS IS THE ONLY KEYWORD IN LOG',
      '',
      ' ',
    ];
    
    cwlogs.forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, '" "')).toBeTruthy();
    });

    // TODO: verify if "" should also match everything (i.e. no space)
    cwlogs.forEach((cwlog: string) => {
      expect(isCloudwatchLogFilterMatch(cwlog, '""')).toBeTruthy();
    });
  })
});


// describe('Using metric filters to match terms and extract values from JSON log events', () => {
//   test('Metric filters that match strings', () => {


// // I checked manually in console under
// // CWLogs > Log Groups > Actions > Create Metric Filter
// // 
// // Basically it's like this
// // You can either only basic search (typical search in log group), or you can create a metric filter = search + metric count
// // 
// // [Basic] only has the 'basic' pattern matching enabled (no JSON special handling possible - only can double quote it for exact match since nonalphanumeric)
// // [Metric Filter] has both kinds of searches enabled
// //    - can search by 'basic' patterns
// //    - can search using special JSON syntax
// //        - This is extended so you can map values to specifc metric attributes based on log syntax
// //
// // The CW Logs "Tester" is under the "Create a Metric Filter" action, so both are enabled
// //    - Searching using 'basic' syntax matches results ***even inside of JSON-formatted logs***
// //        - This is of course because JSON logs are simply strings that "conveniently" adhere to the JSON syntax
// //    - Searching using 'special' (e.g. JSON) syntax only possibly means you are trying to look for special kinds of logs (e.g. JSON)



//     expect(
//       isCloudwatchLogFilterMatch(
//         '{ "eventType" : "UpdateTrail" })',
//         '{ $.eventType = "UpdateTrail" }'
//       )
//     ).toBeTruthy();

//     expect(
//       isCloudwatchLogFilterMatch(
//         '{ "eventType" : "UpdateTrail" })',
//         '{ $.eventType = UpdateTrail }'
//       )
//     ).toBeTruthy();
//   });
// });

// describe('Using metric filters to extract values from space-delimited log events', () => {});
// describe('Configuring metric values for a metric filter', () => {});
// describe('Publishing dimensions with metrics from values in JSON or space-delimited log events', () => {});
// describe("Using values in log events to increment a metric's value", () => {});
