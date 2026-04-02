import { $dt, $t, dataHandler } from '@/shared/data-handler';
import { createError } from '@/shared/throw-error';
import type { AnyFunc } from '@/shared/types/base';
import { isFunction, isPromiseLike } from '@/shared/utils/verify';
import { withResolvers } from '@/shared/with-resolvers';

interface AllxOptions {
  allSettled?: boolean;
}

type AllxTaskValue<T> = T extends AnyFunc ? Awaited<ReturnType<T>> : Awaited<T>;

interface AllxContext<M extends Record<PropertyKey, AnyFunc>> {
  $: { [P in keyof M]: Promise<AllxTaskValue<M[P]>> };
}

type AllxResult<M extends Record<PropertyKey, AnyFunc>, O extends AllxOptions = AllxOptions> = {
  [P in keyof M]: O['allSettled'] extends true ? PromiseSettledResult<Awaited<ReturnType<M[P]>>> : AllxTaskValue<M[P]>;
};

function createDepProxy(
  tasks: Record<PropertyKey, AnyFunc>,
  results: Record<PropertyKey, any>,
  options: Required<AllxOptions>,
) {
  const resolverMap = new Map<PropertyKey, PromiseWithResolvers<any>>();
  const taskNameSet = new Set(Reflect.ownKeys(tasks) as PropertyKey[]);

  const depProxy = new Proxy(
    {},
    {
      async get(_, depName: string) {
        if (!taskNameSet.has(depName)) {
          return Promise.reject(createError('allx', `Unknown task "${String(depName)}"`));
        }
        if (Reflect.getOwnPropertyDescriptor(results, depName)) {
          const cached = results[depName];
          if (options.allSettled) {
            return cached.status === 'rejected' ? Promise.reject(cached.reason) : Promise.resolve(cached.value);
          }
          return Promise.resolve(cached);
        }
        const depResolvers = resolverMap.get(depName);
        if (depResolvers) {
          return depResolvers.promise;
        }
        const resolvers = withResolvers();
        resolverMap.set(depName, resolvers);
        const cleanup = () => {
          resolverMap.delete(depName);
        };
        return resolvers.promise.then(
          (value) => {
            cleanup();
            return value;
          },
          (error) => {
            cleanup();
            throw error;
          },
        );
      },
    },
  );

  return { depProxy, taskNameSet, resolverMap };
}

function getValueFormatFunc(options?: AllxOptions) {
  if (!options) {
    return (value: any, _type: PromiseSettledResult<any>['status'] = 'fulfilled') => value;
  }
  if (options.allSettled) {
    return (value: any, status: PromiseSettledResult<any>['status'] = 'fulfilled') =>
      status === 'fulfilled' ? { status, value } : { status, reason: value };
  }
  return (value: any, _type: PromiseSettledResult<any>['status'] = 'fulfilled') => value;
}

const validInfo = $dt({
  allSettled: $t.boolean(false),
});

/**
 * 支持自动依赖优化和完整类型推断的 Promise.all, 执行任务时自动解决依赖关系。
 *
 * @platform web, node, webworker
 * @example
 * const { a, b, c } = await allx({
 *   a() { return 1 },
 *   async b() { return 'hello' },
 *   async c() { return (await this.$.a) + 10 }
 * })
 */
export async function allx<M extends Record<PropertyKey, any>, O extends AllxOptions>(
  tasks: M & ThisType<AllxContext<M>>,
  options?: O,
): Promise<AllxResult<M, O>> {
  const validOptions = dataHandler(options || {}, validInfo, { unwrap: true });
  const { allSettled } = validOptions;
  const results: Record<PropertyKey, any> = {};
  const { depProxy, taskNameSet, resolverMap } = createDepProxy(tasks, results, validOptions);
  const valueFormat = getValueFormatFunc(options);

  const context = {
    $: depProxy,
  };

  const promises = [] as Promise<any>[];

  taskNameSet.forEach(async (name) => {
    const taskFn = tasks[name];

    const taskResolvers = withResolvers();
    taskResolvers.promise.then(
      (value) => {
        results[name] = valueFormat(value, 'fulfilled');
        const depResolvers = resolverMap.get(name);
        if (depResolvers) {
          depResolvers.resolve(value);
        }
        return value;
      },
      (error) => {
        const depResolvers = resolverMap.get(name);
        if (allSettled) {
          results[name] = valueFormat(error, 'rejected');
        }
        if (depResolvers) {
          depResolvers.reject(error);
        }
      },
    );

    promises.push(taskResolvers.promise);

    if (isPromiseLike(taskFn)) {
      await taskFn.then(taskResolvers.resolve, taskResolvers.reject);
      return;
    }
    if (!isFunction(taskFn)) {
      taskResolvers.resolve(taskFn);
      return;
    }

    try {
      const result = await taskFn.call(context);
      taskResolvers.resolve(result);
    } catch (error) {
      taskResolvers.reject(error);
    }
  });

  if (allSettled) {
    return Promise.allSettled(promises).then(() => results as any);
  }

  return Promise.all(promises).then(() => results as any);
}
