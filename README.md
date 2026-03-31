# Fold-Space Engine

Canonical Part II artifact/reference for the Fold-Space / Zora Discovery app family.
This repo should be treated as the immutable artifact surface, not the active integration target for web, mobile, or desktop packaging.

Live site:

- https://cbaird26.github.io/fold-space-engine-phase-v/

Related public repos:

- Part I public foundation: [`fold-space-engine`](https://github.com/Cbaird26/fold-space-engine)
- Combined web app: [`zora-discovery`](https://github.com/Cbaird26/zora-discovery)
- Mobile shell: [`zora-discovery-mobile`](https://github.com/Cbaird26/zora-discovery-mobile)
- Desktop shell: [`zora-discovery-desktop`](https://github.com/Cbaird26/zora-discovery-desktop)

## Canonical status

This repo is the artifact/reference build.

That means:

- runtime behavior should remain stable
- downstream integrations should copy from here rather than modify it in place
- future mobile work belongs in `zora-discovery-mobile`
- future desktop work belongs in `zora-discovery-desktop`
- combined public web work belongs in `zora-discovery`

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
- A `Coherence Engine Warp Core` visualization helps users graphically build and hold coherence either until fold-state arrival or in indefinite-hold mode
- Practical labels such as `Future Viability`, `Coherence Stability`, `Instability Risk`, and `Experimental Visibility` sit on top of the same mathematical core

## Source lineage

- Seed scaffold: `~/Downloads/fold-space-engine-phase-v`
- Monolithic ancestor: `~/Downloads/mqgt-speculative-lab.jsx`
- Evolved from a smaller public demo surface into a larger research-facing build

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
