import type { PersistedProductState } from "./types";

export const PRODUCT_STATE_STORAGE_KEY = "fold-space-engine-product-state";
const VALID_MODES = new Set(["DECISION", "INTENT", "NAVIGATION", "RESEARCH"]);
const VALID_HOLD_MODES = new Set(["ARRIVAL", "INDEFINITE"]);

export function serializePersistedProductState(state: PersistedProductState) {
  return JSON.stringify(state);
}

export function deserializePersistedProductState(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedProductState>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.mode !== "string" ||
      !VALID_MODES.has(parsed.mode) ||
      !Array.isArray(parsed.decisionOptions) ||
      typeof parsed.selectedDecisionId !== "string" ||
      !parsed.intentScenario ||
      typeof parsed.coherenceHoldMode !== "string" ||
      !VALID_HOLD_MODES.has(parsed.coherenceHoldMode) ||
      !parsed.advancedOpen
    ) {
      return null;
    }

    return parsed as PersistedProductState;
  } catch {
    return null;
  }
}

export function loadPersistedProductState() {
  if (typeof window === "undefined") {
    return null;
  }

  return deserializePersistedProductState(window.localStorage.getItem(PRODUCT_STATE_STORAGE_KEY));
}

export function savePersistedProductState(state: PersistedProductState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRODUCT_STATE_STORAGE_KEY, serializePersistedProductState(state));
}
