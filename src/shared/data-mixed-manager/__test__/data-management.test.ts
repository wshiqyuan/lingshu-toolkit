import { describe, expect, test, vi } from 'vitest';
import { dataMixedManager } from '../index';

describe('dataMixedManager - 数据管理', () => {
  let manager: ReturnType<typeof dataMixedManager<number>>;

  test('追加空数组', () => {
    manager = dataMixedManager<number>();
    manager.appendList([]);
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(0);
  });

  test('清空普通数据列表后重新添加', () => {
    manager = dataMixedManager<number>();
    manager.appendList([1, 2, 3]);
    manager.clearList();
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(0);
  });

  test('增量更新', () => {
    manager = dataMixedManager<number>();
    manager.appendList([1, 2, 3]);
    const firstData = [...manager.getMixedData()];
    manager.appendList([4, 5]);
    const secondData = manager.getMixedData();
    expect(firstData).toHaveLength(3);
    expect(secondData).toHaveLength(5);
    expect(secondData[0]).toEqual(firstData[0]);
    expect(secondData[1]).toEqual(firstData[1]);
    expect(secondData[2]).toEqual(firstData[2]);
  });

  test('延迟构建模式', () => {
    const change = vi.fn();
    manager = dataMixedManager<number>({ listener: { change } });
    // lazy 后不会进行数据构建
    manager.appendList([1, 2, 3], { lazy: true });
    expect(change).toHaveBeenCalledTimes(0);
    // 获取时构建 1 次
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(3);
    expect(change).toHaveBeenCalledTimes(1);
    // 没有 lazy 默认构建
    manager.appendList([1, 2, 3]);
    expect(change).toHaveBeenCalledTimes(2);
    // 已经构建过了, 且没有数据变更不重复构建
    const mixedData2 = manager.getMixedData();
    expect(mixedData2).toHaveLength(6);
    expect(change).toHaveBeenCalledTimes(2);
  });
});
