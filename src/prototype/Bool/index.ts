import { PrototypeFunction, PrototypeFunctions } from "@/@types/prototype";
import { processRaw } from "@/prototype/Bool/raw";
import { processToASNumber } from "@/prototype/Bool/toASNumber";
import { processToASString } from "@/prototype/Bool/toASString";

export type PrototypeBoolFunction = PrototypeFunction<boolean>;

const prototypeBoolFunctions: PrototypeFunctions<boolean> = {
  toASNumber: processToASNumber,
  toASString: processToASString,
  toASBoolean: processRaw,
  raw: processRaw,
};

export { prototypeBoolFunctions };
