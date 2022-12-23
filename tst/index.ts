import {describe, expect, test} from '@jest/globals';
import {isCloudwatchLogFilterMatch} from "src/index";

type CWLogFilterTestCase = {
  readonly cwlog: string;
  readonly filter: string;
  readonly expected: boolean;
};

function runTestCases(testCases: Array<CWLogFilterTestCase>) {
  test.each(testCases)(
    '$cwlog | $filter | $expected',
    (testCase: CWLogFilterTestCase) => {
      expect(isCloudwatchLogFilterMatch(testCase.cwlog, testCase.filter)).toBe(testCase.expected);
    }
  );
};

describe('Using filter patterns to match terms in log events', () => {

  describe('Filter patterns are case sensitive', () => {
    runTestCases([
      {
        cwlog: 'Cloudwatch',
        filter: 'Cloudwatch',
        expected: true,
      },
      {
        cwlog: 'Cloudwatch',
        filter: 'cloudwatch',
        expected: false,
      },
    ]);
  });
  describe('Enclose exact phrases and terms that include non-alphanumeric characters in double quotation marks ("")', () => {
    runTestCases([
      {
        cwlog: 'Cloud logs watch',
        filter: 'Cloud watch',
        expected: true,
      },
      {
        cwlog: 'Cloud logs watch',
        filter: '"Cloud watch"',
        expected: false,
      },
      {
        cwlog: 'Cloud watch logs',
        filter: '"Cloud watch"',
        expected: true,
      },
      {
        cwlog: 'Cloud watch logs',
        filter: 'Cloud watch',
        expected: true,
      },

      // TODO: Verify what happens when non-alphanumeric is not in double quotes
      {
        cwlog: '#Cloud watch',
        filter: '#Cloud',
        expected: false,
      },
      {
        cwlog: '#Cloud watch',
        filter: '"#cloud"',
        expected: false,
      },
      {
        cwlog: '#Cloud watch',
        filter: '"#Cloud"',
        expected: true,
      },

      // TODO: Verify: Does cloudwatch support multiple phrases like '"cloudwatch logs" "@example"' ? 
      {
        cwlog: '#Cloud #watch',
        filter: '"#Cloud" #watch',
        expected: false,
      },
      {
        cwlog: '#Cloud #watch',
        filter: '"#Cloud" "#watch"',
        expected: true,
      },
    ]);
  });

  describe('Match a single term', () => {
    runTestCases([
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: 'ERROR',
        expected: true,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: 'ERROR',
        expected: true,
      },
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: 'ERROR',
        expected: true,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: 'ERROR',
        expected: true,
      },
      {
        cwlog: '{"hello" : "world"}',
        filter: 'hello',
        expected: true,
      },
      {
        cwlog: '{"hello" : "world"}',
        filter: '"world"',
        expected: true,
      },
      {
        cwlog: '{"hello" : "world"}',
        filter: '"{"',
        expected: true,
      },
      {
        cwlog: '{"hello" : "world"}',
        filter: '{',
        expected: false,
      },
      {
        cwlog: '{"hello" : "world"}',
        filter: '"',
        expected: false,
      },
    ]);
  });
  describe('Match multiple terms', () => {
    runTestCases([
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: 'ERROR ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: 'ERROR ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: 'ERROR ARGUMENTS',
        expected: false,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: 'ERROR ARGUMENTS',
        expected: false,
      },
    ]);
  });

  describe('Match single and multiple terms', () => {
    runTestCases([
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      {
        cwlog: 'ARGUMENTS IS THE ONLY KEYWORD IN LOG',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: '?ERROR ?ARGUMENTS',
        expected: true,
      },
      // TODO: verify should be false if doesn't have **at least one** term
      {
        cwlog: 'false',
        filter: '?ERROR ?ARGUMENTS',
        expected: false,
      },
    ]);
  });

  describe('Match exact phrases', () => {
    runTestCases([
      {
        cwlog: '[ERROR 500] INTERNAL SERVER ERROR', 
        filter: '"INTERNAL SERVER ERROR"',
        expected: true,
      },
      {
        cwlog: '[ERROR 500] INTERNAL SERVER', 
        filter: '"INTERNAL SERVER ERROR"',
        expected: false,
      },
    ])
  });

  describe('Include and exclude terms', () => {
    runTestCases([
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: 'ERROR -ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: 'ERROR -ARGUMENTS',
        expected: true,
      },
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: 'ERROR -ARGUMENTS',
        expected: false,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: 'ERROR -ARGUMENTS',
        expected: false,
      }
    ]);
  })

  describe("Match everything", () => {
    runTestCases([
      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: 'ARGUMENTS IS THE ONLY KEYWORD IN LOG',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: '',
        filter: '" "',
        expected: true,
      },
      {
        cwlog: ' ',
        filter: '" "',
        expected: true,
      },

      {
        cwlog: '[ERROR 400] BAD REQUEST',
        filter: '""',
        expected: true,
      },
      {
        cwlog: '[ERROR 401] UNAUTHORIZED REQUEST',
        filter: '""',
        expected: true,
      },
      {
        cwlog: '[ERROR 419] MISSING ARGUMENTS',
        filter: '""',
        expected: true,
      },
      {
        cwlog: '[ERROR 420] INVALID ARGUMENTS',
        filter: '""',
        expected: true,
      },
      {
        cwlog: 'ARGUMENTS IS THE ONLY KEYWORD IN LOG',
        filter: '""',
        expected: true,
      },
      {
        cwlog: '',
        filter: '""',
        expected: true,
      },
      {
        cwlog: ' ',
        filter: '""',
        expected: true,
      },
    ]);
  });
});


// describe('Using metric filters to match terms and extract values from JSON log events', () => {
//   test('Metric filters that match strings', () => {


// // // I checked manually in console under
// // // CWLogs > Log Groups > Actions > Create Metric Filter
// // // 
// // // Basically it's like this
// // // You can either only basic search (typical search in log group), or you can create a metric filter = search + metric count
// // // 
// // // [Basic] only has the 'basic' pattern matching enabled (no JSON special handling possible - only can double quote it for exact match since nonalphanumeric)
// // // [Metric Filter] has both kinds of searches enabled
// // //    - can search by 'basic' patterns
// // //    - can search using special JSON syntax
// // //        - This is extended so you can map values to specifc metric attributes based on log syntax
// // //
// // // The CW Logs "Tester" is under the "Create a Metric Filter" action, so both are enabled
// // //    - Searching using 'basic' syntax matches results ***even inside of JSON-formatted logs***
// // //        - This is of course because JSON logs are simply strings that "conveniently" adhere to the JSON syntax
// // //    - Searching using 'special' (e.g. JSON) syntax only possibly means you are trying to look for special kinds of logs (e.g. JSON)



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