import { describe, expect, test, vi } from 'vitest';
import { dataMixedManager } from '../index';

describe('dataMixedManager - 构建选项', () => {
  let manager: ReturnType<typeof dataMixedManager<number>>;

  test('rebuild 模式 - 全量重建', () => {
    manager = dataMixedManager<number>();
    const changeHandler = vi.fn();
    manager.addEventListener('change', changeHandler);

    manager.addFixedSlot({ position: 2, data: 100 });
    manager.appendList([1, 2, 3]);
    const firstData = [...manager.getMixedData()];
    // [1, 100, 2, 3]

    // 第一次 appendList 触发 rebuild 模式
    expect(changeHandler).toHaveBeenCalledTimes(1);
    const firstEvent = changeHandler.mock.calls[0][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    expect(firstEvent.detail.mode).toBe('rebuild');

    manager.appendList([4, 5], { mode: 'rebuild' });
    const secondData = manager.getMixedData();
    // [1, 100, 2, 3, 4, 5]

    // 第二次 appendList 显式指定 rebuild 模式
    expect(changeHandler).toHaveBeenCalledTimes(2);
    const secondEvent = changeHandler.mock.calls[1][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    expect(secondEvent.detail.mode).toBe('rebuild');

    expect(firstData).toHaveLength(4);
    expect(secondData).toHaveLength(6);
  });

  test('patch 模式 - 增量更新', () => {
    manager = dataMixedManager<number>();
    const changeHandler = vi.fn();
    manager.addEventListener('change', changeHandler);

    manager.addFixedSlot({ position: 2, data: 100 });
    manager.appendList([1, 2, 3]);
    const firstData = [...manager.getMixedData()];

    // 第一次 appendList 触发 rebuild 模式
    expect(changeHandler).toHaveBeenCalledTimes(1);
    const firstEvent = changeHandler.mock.calls[0][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    expect(firstEvent.detail.mode).toBe('rebuild');

    manager.appendList([4, 5], { mode: 'patch' });
    const secondData = manager.getMixedData();

    // 第二次 appendList 触发 patch 模式
    expect(changeHandler).toHaveBeenCalledTimes(2);
    const secondEvent = changeHandler.mock.calls[1][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    expect(secondEvent.detail.mode).toBe('patch');

    expect(firstData).toHaveLength(4);
    expect(secondData).toHaveLength(6);
  });

  test('clear 模式 - 清空数据', () => {
    manager = dataMixedManager<number>();
    const changeHandler = vi.fn();
    manager.addEventListener('change', changeHandler);

    manager.appendList([1, 2, 3]);
    manager.clearList();

    // clearList 触发 clear 模式
    expect(changeHandler).toHaveBeenCalledTimes(2);
    const firstEvent = changeHandler.mock.calls[0][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    const secondEvent = changeHandler.mock.calls[1][0] as CustomEvent<{ mode: string; mixedData: any[] }>;
    expect(firstEvent.detail.mode).toBe('rebuild');
    expect(secondEvent.detail.mode).toBe('clear');
  });
});
