export type Nullable<T> = T | null;
export type AsyncResult<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
