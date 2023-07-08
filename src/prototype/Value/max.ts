import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { GreaterThan } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processMax: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  return object == value || GreaterThan(object, value) ? object : value;
};

export { processMax };
