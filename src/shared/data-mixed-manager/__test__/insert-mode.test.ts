import { describe, expect, test } from 'vitest';
import { dataMixedManager } from '../index';

describe('dataMixedManager - 插入模式', () => {
  let manager: ReturnType<typeof dataMixedManager<number>>;

  test('cover 模式 - 覆盖现有定坑', () => {
    manager = dataMixedManager<number>();
    // 先添加定坑配置，由于没有数据，不会触发构建
    manager.addFixedSlot({ position: 2, data: 100 });
    manager.addFixedSlot({ position: 2, data: 200, insertMode: 'cover' });
    // 再添加数据，appendList 会触发构建
    // 由于 prevDataLength = 0，会全量构建，定坑会被插入
    manager.appendList([1, 2, 3]);
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(4);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: true, type: 'fixed', data: 200 });
    expect(mixedData[3]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });

  test('before 模式 - 在指定位置前插入', () => {
    manager = dataMixedManager<number>();
    // 先添加定坑配置，由于没有数据，不会触发构建
    manager.addFixedSlot({ position: 3, data: 200 });
    const position = manager.addFixedSlot({ position: 3, data: 100, insertMode: 'before' });
    expect(position).toBe(3);
    // 再添加数据，appendList 会触发构建
    // 由于 prevDataLength = 0，会全量构建，但定坑位置3超出了范围，不会被插入
    manager.appendList([1, 2, 3]);
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(3);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: false, type: 'plain', data: 3 });
    manager.appendList([4]);
    const mixedData2 = manager.getMixedData();
    expect(mixedData2).toHaveLength(6);
    expect(mixedData2[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData2[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData2[2]).toEqual({ isFixed: false, type: 'plain', data: 3 });
    expect(mixedData2[3]).toEqual({ isFixed: true, type: 'fixed', data: 100 });
    expect(mixedData2[4]).toEqual({ isFixed: true, type: 'fixed', data: 200 });
    expect(mixedData2[5]).toEqual({ isFixed: false, type: 'plain', data: 4 });
  });

  test('after 模式 - 在指定位置后插入', () => {
    manager = dataMixedManager<number>();
    // 先添加定坑配置，由于没有数据，不会触发构建
    manager.addFixedSlot({ position: 2, data: 100 });
    const position = manager.addFixedSlot({ position: 2, data: 200, insertMode: 'after' });
    expect(position).toBe(3);
    // 再添加数据，appendList 会触发构建
    // 由于 prevDataLength = 0，会全量构建，定坑会被插入
    manager.appendList([1, 2, 3]);
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(5);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: true, type: 'fixed', data: 100 });
    expect(mixedData[3]).toEqual({ isFixed: true, type: 'fixed', data: 200 });
    expect(mixedData[4]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });

  test('insertSlot 插卡模式', () => {
    manager = dataMixedManager<number>();
    manager.appendList([1, 2, 3]);
    // insertSlot 在 position=2，由于 2 <= prevDataLength (3)，会触发全量重建
    manager.insertSlot({ position: 2, data: 100, insertMode: 'before' });
    const mixedData = manager.getMixedData();
    // 结果: [1, 2, 100, 3] (定坑位置基于混合结果)
    expect(mixedData).toHaveLength(4);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: true, type: 'insert', data: 100 });
    expect(mixedData[3]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });

  test('insertSlots 批量插卡', () => {
    manager = dataMixedManager<number>();
    manager.appendList([1, 2, 3]);
    const positions = manager.insertSlots([
      { position: 2, data: 100, insertMode: 'before' },
      { position: 3, data: 200, insertMode: 'before' },
    ]);
    expect(positions).toEqual([2, 3]);
    const mixedData = manager.getMixedData();
    // 结果: [1, 2, 100, 200, 3] (定坑位置基于混合结果)
    expect(mixedData).toHaveLength(5);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: true, type: 'insert', data: 100 });
    expect(mixedData[3]).toEqual({ isFixed: true, type: 'insert', data: 200 });
    expect(mixedData[4]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });
});
