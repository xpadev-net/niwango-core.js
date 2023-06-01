import { execute } from "@/context";
import { Equality } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processEquals: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  return Equality(object, value);
};

export { processEquals };
