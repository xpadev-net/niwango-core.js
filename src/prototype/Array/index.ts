import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";

import { processIndex } from "./_index";
import { processJoin } from "./join";
import { processPop } from "./pop";
import { processProduct } from "./product";
import { processPush } from "./push";
import { processShift } from "./shift";
import { processSize } from "./size";
import { processSort } from "./sort";
import { processSum } from "./sum";
import { processUnshift } from "./unshift";
import { processWalk } from "./walk";

export type PrototypeArrayFunction = PrototypeFunction<Array<unknown>>;

const prototypeArrayFunctions: PrototypeFunctions<Array<unknown>> = {
  index: processIndex,
  size: processSize,
  unshift: processUnshift,
  join: processJoin,
  push: processPush,
  shift: processShift,
  pop: processPop,
  sort: processSort,
  sum: processSum,
  product: processProduct,
  walk: processWalk,
};

export { prototypeArrayFunctions };
