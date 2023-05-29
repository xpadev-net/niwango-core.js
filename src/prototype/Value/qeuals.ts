import { execute } from "@/context";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processEquals: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  return object === value;
};

export { processEquals };
