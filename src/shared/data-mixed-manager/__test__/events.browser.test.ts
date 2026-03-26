import { describe, expect, test, vi } from 'vitest';
import { dataMixedManager } from '../index';

describe('dataMixedManager browser', () => {
  test('window 事件触发', () => {
    const manager = dataMixedManager<number>();
    const windowChangeHandler = vi.fn();
    window.addEventListener('[DMM]:change', windowChangeHandler);
    manager.appendList([1, 2, 3]);
    expect(windowChangeHandler).toHaveBeenCalledTimes(1);
    window.removeEventListener('[DMM]:change', windowChangeHandler);
  });
});
