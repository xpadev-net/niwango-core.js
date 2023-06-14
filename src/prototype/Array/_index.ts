import { execute } from "@/context";
import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processIndex: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace
) => {
  const index = execute(script.arguments[0], scopes, trace);
  if (typeof index === "number") {
    return object[index];
  }
  return object[Number(index)];
};

export { processIndex };
