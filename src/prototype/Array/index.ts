import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processJoin } from "@/prototype/Array/join";
import { processPop } from "@/prototype/Array/pop";
import { processProduct } from "@/prototype/Array/product";
import { processPush } from "@/prototype/Array/push";
import { processShift } from "@/prototype/Array/shift";
import { processSort } from "@/prototype/Array/sort";
import { processSum } from "@/prototype/Array/sum";

import { processIndex } from "./_index";
import { processSize } from "./size";
import { processUnshift } from "./unshift";

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
};

export { prototypeArrayFunctions };
