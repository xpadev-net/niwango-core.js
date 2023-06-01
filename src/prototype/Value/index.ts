import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processIndex } from "@/prototype/Value/_index";
import { processAdd } from "@/prototype/Value/add";
import { processAlternative } from "@/prototype/Value/alternative";
import { processCall } from "@/prototype/Value/call";
import { processCompare } from "@/prototype/Value/compare";
import { processDivide } from "@/prototype/Value/divide";
import { processEquals } from "@/prototype/Value/equals";
import { processForEachSlot } from "@/prototype/Value/forEachSlot";
import { processHashCode } from "@/prototype/Value/hashCode";
import { processHasSlot } from "@/prototype/Value/hasSlot";
import { processMinus } from "@/prototype/Value/minus";
import { processModulo } from "@/prototype/Value/modulo";
import { processMultiply } from "@/prototype/Value/multiply";
import { processPlus } from "@/prototype/Value/plus";
import { processRaw } from "@/prototype/Value/raw";
import { processSubtract } from "@/prototype/Value/subtract";
import { processToASBoolean } from "@/prototype/Value/toASBoolean";
import { processToASNumber } from "@/prototype/Value/toASNumber";
import { processToASString } from "@/prototype/Value/toASString";

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
};

export { prototypeValueFunctions };
