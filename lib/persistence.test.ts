import { describe, expect, it } from "vitest";
import { deserializePersistedProductState, serializePersistedProductState } from "./persistence";
import { DEFAULT_DECISION_OPTIONS, DEFAULT_INTENT_SCENARIO } from "./productModel";

describe("product state persistence", () => {
  it("round-trips product state", () => {
    const serialized = serializePersistedProductState({
      mode: "DECISION",
      decisionOptions: DEFAULT_DECISION_OPTIONS,
      selectedDecisionId: DEFAULT_DECISION_OPTIONS[0].id,
      intentScenario: DEFAULT_INTENT_SCENARIO,
      advancedOpen: {
        decision: true,
        intent: false,
      },
    });

    const restored = deserializePersistedProductState(serialized);

    expect(restored).not.toBeNull();
    expect(restored?.mode).toBe("DECISION");
    expect(restored?.decisionOptions).toHaveLength(3);
    expect(restored?.advancedOpen.decision).toBe(true);
  });
});
