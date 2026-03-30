import type { LoggedRun } from "./types";

export function buildRunLog(run: LoggedRun) {
  return JSON.stringify(run, null, 2);
}

export function serializeRunArchive(runs: LoggedRun[]) {
  return JSON.stringify(runs, null, 2);
}
