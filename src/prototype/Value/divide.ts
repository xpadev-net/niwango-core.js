import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Division } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processDivide: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Division(object, value);
};

export { processDivide };
