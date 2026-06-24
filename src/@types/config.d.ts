export type ResourceLimits = {
  loopIterations: number;
  timesIterations: number;
  stringRepeatCount: number;
  stringRepeatLength: number;
  recursionDepth: number;
};

export type baseConfig = {
  stageWidth: {
    default: number;
    full: number;
  };
  stageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  resourceLimits: ResourceLimits;
  recursionLimit?: number;
};
