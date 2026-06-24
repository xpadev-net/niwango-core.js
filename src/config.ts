import type { A_ANY, T_scope } from "@/@types/ast";
import type { baseConfig } from "@/@types/config";
import { ResourceLimitError } from "@/errors/ResourceLimitError";

let config: baseConfig;
const DEFAULT_RESOURCE_LIMITS: baseConfig["resourceLimits"] = {
  loopIterations: 10000,
  timesIterations: 10000,
  stringRepeatCount: 10000,
  stringRepeatLength: 1000000,
  recursionDepth: 1000,
};

type ResourceLimitKey = keyof baseConfig["resourceLimits"];

const initConfig = () => {
  config = {
    stageWidth: {
      default: 512,
      full: 672,
    },
    stageHeight: 384,
    canvasWidth: 672,
    canvasHeight: 384,
    resourceLimits: { ...DEFAULT_RESOURCE_LIMITS },
  };
};

const getResourceLimit = (limitName: ResourceLimitKey) => {
  if (limitName === "recursionDepth" && config.recursionLimit !== undefined) {
    return config.recursionLimit || Number.POSITIVE_INFINITY;
  }
  return config.resourceLimits[limitName];
};

const assertResourceLimit = (
  limitName: ResourceLimitKey,
  actual: number,
  ast?: A_ANY,
  scopes?: T_scope[],
  displayName: string = limitName,
) => {
  const limit = getResourceLimit(limitName);
  if (actual > limit) {
    throw new ResourceLimitError(displayName, limit, actual, ast, scopes);
  }
};

export {
  assertResourceLimit,
  config,
  DEFAULT_RESOURCE_LIMITS,
  getResourceLimit,
  initConfig,
};
