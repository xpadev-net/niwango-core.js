import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Subtraction } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";
import { A_ANY } from "@/@types";

const processSubtract: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Subtraction(object, value);
};

export { processSubtract };
