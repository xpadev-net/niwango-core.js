import { execute } from "@/context";
import { LessThan } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";
import { A_ANY } from "@/@types";

const processCompare: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (object === value) return 0;
  if (LessThan(object, value)) return -1;
  return 1;
};

export { processCompare };
