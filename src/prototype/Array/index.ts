import type { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processToASString } from "@/prototype/Array/toASString";

import { processIndex } from "./_index";
import { processAdd } from "./add";
import { processAssign } from "./assign";
import { processAt } from "./at";
import { processFind } from "./find";
import { processFold } from "./fold";
import { processForEachEntry } from "./forEachEntry";
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
  add: processAdd,
  find: processFind,
  toASString: processToASString,
  at: processAt,
  assign: processAssign,
  fold: processFold,
  forEachEntry: processForEachEntry,
};

export { prototypeArrayFunctions };
