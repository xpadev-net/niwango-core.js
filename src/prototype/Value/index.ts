import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processIndex } from "@/prototype/Value/_index";
import { processAdd } from "@/prototype/Value/add";
import { processAlternative } from "@/prototype/Value/alternative";
import { processAnd } from "@/prototype/Value/and";
import { processCall } from "@/prototype/Value/call";
import { processComma } from "@/prototype/Value/comma";
import { processCompare } from "@/prototype/Value/compare";
import { processDivide } from "@/prototype/Value/divide";
import { processEquals } from "@/prototype/Value/equals";
import { processForEachSlot } from "@/prototype/Value/forEachSlot";
import { processGreaterThan } from "@/prototype/Value/greaterThan";
import { processHashCode } from "@/prototype/Value/hashCode";
import { processHasSlot } from "@/prototype/Value/hasSlot";
import { processLessThan } from "@/prototype/Value/lessThan";
import { processMax } from "@/prototype/Value/max";
import { processMin } from "@/prototype/Value/min";
import { processMinus } from "@/prototype/Value/minus";
import { processModulo } from "@/prototype/Value/modulo";
import { processMultiply } from "@/prototype/Value/multiply";
import { processNot } from "@/prototype/Value/not";
import { processNotGreaterThan } from "@/prototype/Value/notGreaterThan";
import { processNotLessThan } from "@/prototype/Value/notLessThan";
import { processOr } from "@/prototype/Value/or";
import { processPlus } from "@/prototype/Value/plus";
import { processRaw } from "@/prototype/Value/raw";
import { processSubtract } from "@/prototype/Value/subtract";
import { processToASBoolean } from "@/prototype/Value/toASBoolean";
import { processToASNumber } from "@/prototype/Value/toASNumber";
import { processToASString } from "@/prototype/Value/toASString";
import { processWhileKari } from "@/prototype/Value/while_kari";

export type PrototypeValueFunction = PrototypeFunction<unknown>;

const prototypeValueFunctions: PrototypeFunctions<unknown> = {
  hasSlot: processHasSlot,
  equals: processEquals,
  compare: processCompare,
  hashCore: processHashCode,
  forEachSlot: processForEachSlot,
  call: processCall,
  sendMessage: processCall,
  raw: processRaw,
  increase: processRaw,
  decrease: processRaw,
  toASNumber: processToASNumber,
  toASString: processToASString,
  toASBoolean: processToASBoolean,
  index: processIndex,
  plus: processPlus,
  minus: processMinus,
  multiply: processMultiply,
  divide: processDivide,
  modulo: processModulo,
  add: processAdd,
  subtract: processSubtract,
  alt: processAlternative,
  alternative: processAlternative,
  lessThan: processLessThan,
  notLessThan: processNotLessThan,
  greaterThan: processGreaterThan,
  notGreaterThan: processNotGreaterThan,
  not: processNot,
  and: processAnd,
  or: processOr,
  comma: processComma,
  min: processMin,
  max: processMax,
  while_kari: processWhileKari,
};

export { prototypeValueFunctions };
