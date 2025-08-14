import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { LessThan } from "@/operators";
import type { PrototypeValueFunction } from "@/prototype/Value/index";

const processLessThan: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return LessThan(object, value);
};

export { processLessThan };
