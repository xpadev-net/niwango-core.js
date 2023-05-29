import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Multiplication } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processMultiply: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Multiplication(object, value);
};

export { processMultiply };
