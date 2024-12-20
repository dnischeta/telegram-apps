import { isRecord } from '@telegram-apps/transformers';
import type {
  UnionRequiredKeys,
  UnionOptionalKeys,
} from '@telegram-apps/toolkit';

import { classNames } from './classNames.js';

export type MergeClassNames<Tuple extends any[]> =
// Removes all types from union that will be ignored by the mergeClassNames
// function.
  Exclude<Tuple[number], number | string | null | undefined | any[] | boolean> extends infer Union
    ?
    & { [K in UnionRequiredKeys<Union>]: string; }
    & { [K in UnionOptionalKeys<Union>]?: string; }
    : never;

/**
 * Merges two sets of classnames.
 *
 * The function expects to pass an array of objects with values that could be
 * passed to the `classNames` function.
 * @returns An object with keys from all objects with merged values.
 * @see classNames
 */
export function mergeClassNames<T extends any[]>(...partials: T): MergeClassNames<T> {
  return partials.reduce<MergeClassNames<T>>((acc, partial) => {
    if (isRecord(partial)) {
      Object.entries(partial).forEach(([key, value]) => {
        const className = classNames((acc as any)[key], value);
        if (className) {
          (acc as any)[key] = className;
        }
      });
    }
    return acc;
  }, {} as MergeClassNames<T>);
}
