import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Remainder } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

//名前はModuloだけど実態はRemainderらしい
const processModulo: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Remainder(object, value);
};

export { processModulo };
