import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Subtraction } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processSubtract: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Subtraction(object, value);
};

export { processSubtract };
