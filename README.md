# Fold-Space Engine

Fold-Space Engine is a constrained future-comparison and fold-space simulation interface. The live app now leads with practical decision and intent flows, while preserving navigation and research surfaces for deeper technical use.

Live site:

- https://cbaird26.github.io/fold-space-engine-phase-v/

## What this project is
- A practical future-viability interface with `Decision`, `Intent`, `Navigation`, and `Research` modes
- A computational simulation environment built on constrained field-style scoring
- A bridge between guided user inputs and explicit parameterized engine outputs
- A tool for generating reproducible runs and exclusion-oriented experiment mappings

## What this project is not
- Not a faster-than-light travel claim
- Not a validated warp-drive implementation
- Not an exact numerical solution to General Relativity
- Not evidence that entanglement enables superluminal transport

## Core reduced model

Fold score:

```text
F = αK + βρ + χΦc + ε(Φc·E) − δI
```

Path weighting:

```text
P(i) ∝ |c_i|² exp(η ΔE_i)
```

Experimental bridge:

```text
V / V0 = exp(-Γ T Δx²)
```

## Scientific stance
This repository is designed to invite falsification. If the experimental mapping produces no excess dephasing or no measurable visibility deviation within defined bounds, the relevant parameter region is constrained or excluded.

## Current live surface
- `Decision` mode is the default entry and compares multiple options under shared constraints
- `Intent` mode maps one outcome into a viability profile with optional raw overrides
- `Navigation` mode preserves destination-vector and corridor-style exploration
- `Research` mode keeps the raw controls, quick sweep, logging, and experiment-facing outputs visible
- Practical labels such as `Future Viability`, `Coherence Stability`, `Instability Risk`, and `Experimental Visibility` sit on top of the same mathematical core

## Source lineage
- Seed scaffold: `~/Downloads/fold-space-engine-phase-v`
- Monolithic ancestor: `~/Downloads/mqgt-speculative-lab.jsx`
- Evolved from a smaller public demo surface into a larger research-facing build

## Project layout

```text
fold-space-engine-phase-v/
  README.md
  package.json
  tsconfig.json
  /app
    layout.tsx
    page.tsx
  /components
    ConstraintPanel.tsx
    DeviceHeader.tsx
    EngineLog.tsx
    EqBlock.tsx
    ExperimentPanel.tsx
    FoldField.tsx
    GlowBox.tsx
    Knob.tsx
    ParameterSweepPanel.tsx
    StarField.tsx
  /lib
    constraints.ts
    engineCore.ts
    foldGeometry.ts
    h2Test.ts
    logging.ts
    probabilityField.ts
    toeBridge.ts
    types.ts
  /docs
    fold_space_engine_anchor_paper.md
    methodology.md
    speculative_appendix.md
  /data
    presets.json
```

## Run locally

```bash
npm install
npm run dev
```

## Deploy

This repo is configured for GitHub Pages via Next.js static export.

Expected live URL:

```text
https://cbaird26.github.io/fold-space-engine-phase-v/
```
