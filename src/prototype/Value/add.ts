import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { Addition } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processAdd: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (value === undefined)
    throw new InvalidTypeError("undefined", script, scopes);
  return Addition(object, value);
};

export { processAdd };
