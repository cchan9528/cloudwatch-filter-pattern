import {describe, expect, test} from '@jest/globals';
import {doSomeStuff} from 'src/foo/index';

describe('basic test', () => {
  test('does some stuff', () => {
    expect(doSomeStuff('1', '2', ['3'])).toBeUndefined();
  });
});
