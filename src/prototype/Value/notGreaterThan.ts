import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { GreaterThan } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processNotGreaterThan: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return !GreaterThan(object, value);
};

export { processNotGreaterThan };
