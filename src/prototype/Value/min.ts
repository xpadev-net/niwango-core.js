import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { LessThan } from "@/operators";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processMin: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  return object == value || LessThan(object, value) ? object : value;
};

export { processMin };
