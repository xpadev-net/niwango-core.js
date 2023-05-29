import { execute } from "@/context";
import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processPush: PrototypeArrayFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  return object.push(value);
};

export { processPush };
