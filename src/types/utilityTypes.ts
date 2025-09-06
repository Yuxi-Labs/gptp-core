// This file contains utility types.

export type Nullable<T> = T | null;

export type Dictionary<T> = Record<string, T>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
