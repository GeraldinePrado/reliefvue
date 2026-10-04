import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { State } from "../shared/types.ts";
import { initialState } from "./policy.ts";
export interface Store {
  state: State;
  save(): Promise<void>;
  exclusive<T>(work: () => Promise<T>): Promise<T>;
}
export async function createStore(
  file: string,
  addresses: Record<string, string> = {},
): Promise<Store> {
  let state: State;
  try {
    state = JSON.parse(await readFile(file, "utf8")) as State;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    state = initialState(addresses);
  }
  let lock: Promise<unknown> = Promise.resolve();
  return {
    state,
    async save() {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file + ".tmp", JSON.stringify(state), { mode: 0o600 });
      await rename(file + ".tmp", file);
    },
    exclusive<T>(work: () => Promise<T>) {
      const next = lock.then(work);
      lock = next.catch(() => {});
      return next;
    },
  };
}
