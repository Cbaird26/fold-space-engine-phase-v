# Fold-Space Engine

Fold-Space Engine is a constrained simulation framework for exploring effective spacetime deformation, coherence-weighted path selection, and measurement-facing visibility suppression mappings.

Live site:

- https://cbaird26.github.io/fold-space-engine-phase-v/

## What this project is
- A computational simulation environment
- A research-facing visualization system
- A bridge between speculative field models and explicit parameterized outputs
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

## Current live surface
- Public Next.js static-export site hosted on GitHub Pages
- Interactive fold field, parameter controls, presets, run logging, and JSON export
- Constraint, visibility, and quick sweep panels exposed in the first-screen experience

## Deploy

This repo is configured for GitHub Pages via Next.js static export.

Expected live URL:

```text
https://cbaird26.github.io/fold-space-engine-phase-v/
```
