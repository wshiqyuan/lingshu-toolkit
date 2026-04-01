import { describe, expect, test } from 'vitest';
import { getError, throwError, throwType } from '.';

describe('throw-error', () => {
  const prefix = '[@cmtlyt/lingshu-toolkit#test]: ';

  test('默认类型', () => {
    expect(() => throwError('test', 'test')).toThrowErrorMatchingInlineSnapshot(`[Error: ${prefix}test]`);
  });

  test('类型错误', () => {
    expect(() => throwType('test', 'test')).toThrowErrorMatchingInlineSnapshot(`[TypeError: ${prefix}test]`);
    expect(() => throwError('test', 'test', TypeError)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: ${prefix}test]`,
    );
  });

  test('其他错误', () => {
    expect(() => throwError('test', 'test', SyntaxError)).toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: ${prefix}test]`,
    );
    expect(() => throwError('test', 'test', EvalError)).toThrowErrorMatchingInlineSnapshot(
      `[EvalError: ${prefix}test]`,
    );
    expect(() => throwError('test', 'test', RangeError)).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: ${prefix}test]`,
    );
    expect(() => throwError('test', 'test', ReferenceError)).toThrowErrorMatchingInlineSnapshot(
      `[ReferenceError: ${prefix}test]`,
    );
    expect(() => throwError('test', 'test', URIError)).toThrowErrorMatchingInlineSnapshot(`[URIError: ${prefix}test]`);
  });

  test('获取错误对象', () => {
    expect(getError('test', 'test')).toBeInstanceOf(Error);
    expect(getError('test', 'test', TypeError)).toBeInstanceOf(TypeError);
  });
});
