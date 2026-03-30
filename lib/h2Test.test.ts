import { describe, expect, it } from "vitest";
import { computeGammaEffective, computeVisibility } from "./h2Test";

describe("h2 visibility bridge", () => {
  it("decreases visibility as gamma increases", () => {
    const lowGamma = computeGammaEffective({
      instability: 0.1,
      coherence: 0.8,
      aperture: 0.2,
    });
    const highGamma = computeGammaEffective({
      instability: 0.7,
      coherence: 0.3,
      aperture: 0.8,
    });

    const highVisibility = computeVisibility({ Gamma: lowGamma, T: 1e-6, dx: 1e-3 });
    const lowVisibility = computeVisibility({ Gamma: highGamma, T: 1e-6, dx: 1e-3 });

    expect(highGamma).toBeGreaterThan(lowGamma);
    expect(lowVisibility).toBeLessThan(highVisibility);
  });
});
