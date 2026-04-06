import type { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";

import { processAbs } from "./abs";
import { processCos } from "./cos";
import { processDecrease } from "./decrease";
import { processFloor } from "./floor";
import { processHashCode } from "./hashCode";
import { processIncrease } from "./increase";
import { processPow } from "./pow";
import { processRaw } from "./raw";
import { processSin } from "./sin";
import { processTimes } from "./times";
import { processToASString } from "./toASString";

export type PrototypeNumberFunction = PrototypeFunction<number>;

const prototypeNumberFunctions: PrototypeFunctions<number> = {
  floor: processFloor,
  sin: processSin,
  cos: processCos,
  pow: processPow,
  abs: processAbs,
  times: processTimes,
  raw: processRaw,
  hashCode: processHashCode,
  toASNumber: processRaw,
  toASString: processToASString,
  increase: processIncrease,
  decrease: processDecrease,
};

export { prototypeNumberFunctions };
