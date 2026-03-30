export type Vector3 = [number, number, number];
export type EngineMode = "DECISION" | "INTENT" | "NAVIGATION" | "RESEARCH";
export type CoherenceHoldMode = "ARRIVAL" | "INDEFINITE";

export type PracticalInputs = {
  alignment: number;
  complexity: number;
  timeHorizon: number;
  stability: number;
};

export type EngineControls = {
  energy: number;
  curvature: number;
  coherence: number;
  ethics: number;
  instability: number;
  eta: number;
  target: Vector3;
};

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

export type DecisionOption = {
  id: string;
  name: string;
  inputs: PracticalInputs;
  overrides?: Partial<EngineControls>;
};

export type IntentScenario = {
  label: string;
  inputs: PracticalInputs;
  overrides?: Partial<EngineControls>;
};

export type ScenarioEvaluation = {
  label: string;
  practicalInputs?: PracticalInputs;
  params: EngineControls;
  aperture: number;
  chosenCost: number;
  chosenProbability: number;
  chosenTarget: Vector3;
  constraints: ConstraintReport;
  decisionScore: number;
  engineStatus: string;
  fields: {
    Phi_c: number;
    E: number;
    fieldInteraction: number;
  };
  foldClass: string;
  foldScore: number;
  gammaEff: number;
  insight: string;
  stability: number;
  targetDistance: number;
  visibility: number;
};

export type LoggedRun = {
  timestamp: string;
  mode: EngineMode;
  label: string;
  practicalInputs?: PracticalInputs;
  params: EngineControls;
  outputs: {
    foldScore: number;
    aperture: number;
    stability: number;
    visibility: number;
    foldClass: string;
    chosenCost: number;
    chosenProbability: number;
    insight: string;
  };
  constraints: ConstraintReport;
  comparison?: Array<{
    label: string;
    decisionScore: number;
    foldScore: number;
    riskScore: number;
  }>;
};

export type PersistedProductState = {
  mode: EngineMode;
  decisionOptions: DecisionOption[];
  selectedDecisionId: string;
  intentScenario: IntentScenario;
  coherenceHoldMode: CoherenceHoldMode;
  advancedOpen: {
    decision: boolean;
    intent: boolean;
  };
};
