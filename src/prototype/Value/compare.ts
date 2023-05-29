import { execute } from "@/context";
import { LessThan } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processCompare: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  if (object === value) return 0;
  if (LessThan(object, value)) return -1;
  return 1;
};

export { processCompare };
