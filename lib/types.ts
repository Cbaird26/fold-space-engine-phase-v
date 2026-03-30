export type Vector3 = [number, number, number];
export type FoldMode = "SIM" | "RES" | "EXP";

export type FoldEngineState = {
  origin: Vector3;
  target: Vector3;
  curvature: number;
  energy: number;
  coherence: number;
  ethics: number;
  instability: number;
  eta: number;
  aperture: number;
  foldScore: number;
  stability: number;
  visibility: number;
};

export type Preset = {
  name: string;
  energy: number;
  curvature: number;
  coherence: number;
  ethics: number;
  instability: number;
  eta: number;
  target: Vector3;
};

export type ConstraintReport = {
  causalitySafe: boolean;
  energyBudgetPass: boolean;
  coherenceWindowPass: boolean;
  topologyStable: boolean;
  returnPathAvailable: boolean;
  riskScore: number;
};

export type CandidatePath = {
  offset: Vector3;
  cost: number;
};

export type LoggedRun = {
  timestamp: string;
  mode: FoldMode;
  params: {
    energy: number;
    curvature: number;
    coherence: number;
    ethics: number;
    instability: number;
    eta: number;
    target: Vector3;
  };
  outputs: {
    foldScore: number;
    aperture: number;
    stability: number;
    visibility: number;
    foldClass: string;
    chosenCost: number;
  };
  constraints: ConstraintReport;
};
