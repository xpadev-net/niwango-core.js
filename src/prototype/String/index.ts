import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processIndex } from "@/prototype/String/_index";
import { processEval } from "@/prototype/String/eval";
import { processHashCode } from "@/prototype/String/hashCode";
import { processIndexOf } from "@/prototype/String/indexOf";
import { processMultiply } from "@/prototype/String/multiply";
import { processSize } from "@/prototype/String/size";
import { processSlice } from "@/prototype/String/slice";
import { processToASNumber } from "@/prototype/String/toASNumber";
import { processToASString } from "@/prototype/String/toASString";
import { processToFloat } from "@/prototype/String/toFloat";
import { processToInteger } from "@/prototype/String/toInteger";

export type PrototypeStringFunction = PrototypeFunction<string>;

const prototypeStringFunctions: PrototypeFunctions<string> = {
  index: processIndex,
  size: processSize,
  indexOf: processIndexOf,
  slice: processSlice,
  toInteger: processToInteger,
  toFloat: processToFloat,
  eval: processEval,
  toASNumber: processToASNumber,
  toASString: processToASString,
  raw: processToASString,
  multiply: processMultiply,
  hashCode: processHashCode,
};

export { prototypeStringFunctions };
