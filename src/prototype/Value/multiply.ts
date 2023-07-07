import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Multiplication } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processMultiply: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Multiplication(object, value);
};

export { processMultiply };
