# Methodology

## Core idea
Treat fold-space navigation as a constrained field optimization problem rather than as a claim of realized warp travel.

## Reduced variables
- `K`: curvature proxy
- `ρ`: energy proxy
- `Φc`: coherence proxy
- `E`: teleological / bias proxy
- `I`: instability

## Reduced score

```text
F = αK + βρ + χΦc + ε(Φc·E) − δI
```

## Candidate path generation
Randomly perturb the target vector to produce a candidate cloud, then rank by cost:

```text
C = d / (ρ K Φc + ε0) + λI
```

## Selection
Weight candidates with:

```text
P(i) ∝ |c_i|² exp(η ΔE_i)
```

with `ΔE_i = -C_i`.

## Constraint checks
- Causality-safe flag
- Topology-stable flag
- Return-path flag
- Risk score

## Experimental mapping
Use a dephasing proxy `Γ_eff` and evaluate

```text
V / V0 = exp(-Γ T Δx²)
```
