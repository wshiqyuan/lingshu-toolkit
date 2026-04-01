import { describe, expect, test } from 'vitest';
import { dataMixedManager } from '../index';

describe('dataMixedManager - 基本使用', () => {
  let manager: ReturnType<typeof dataMixedManager<number>>;

  test('导出测试', () => {
    expect(dataMixedManager).toBeTypeOf('function');
  });

  test('创建实例', () => {
    manager = dataMixedManager<number>();
    expect(manager).toBeInstanceOf(EventTarget);
  });

  test('添加定坑配置', () => {
    manager = dataMixedManager<number>();
    const position = manager.addFixedSlot({ position: 1, data: 100 });
    expect(position).toBe(1);
    // 没有普通数据时，定坑数据不会显示
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(0);
  });

  test('追加普通数据', () => {
    manager = dataMixedManager<number>();
    manager.appendList([1, 2, 3]);
    const mixedData = manager.getMixedData();
    expect(mixedData).toHaveLength(3);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });

  test('混合定坑和普通数据 - 先定坑后数据', () => {
    manager = dataMixedManager<number>();
    // 先添加定坑配置，由于没有数据，addFixedSlot 不会触发构建
    manager.addFixedSlot({ position: 2, data: 100 });
    // 再添加数据，appendList 会触发构建（因为 lazy 为 false）
    // 由于 prevDataLength = 0，会全量构建，定坑会被插入
    manager.appendList([1, 2, 3]);
    const mixedData = manager.getMixedData();
    // 结果: [1, 2, 100, 3] (定坑位置基于混合结果)
    expect(mixedData).toHaveLength(4);
    expect(mixedData[0]).toEqual({ isFixed: false, type: 'plain', data: 1 });
    expect(mixedData[1]).toEqual({ isFixed: false, type: 'plain', data: 2 });
    expect(mixedData[2]).toEqual({ isFixed: true, type: 'fixed', data: 100 });
    expect(mixedData[3]).toEqual({ isFixed: false, type: 'plain', data: 3 });
  });
});
