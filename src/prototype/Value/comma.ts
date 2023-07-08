import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processComma: PrototypeValueFunction = (
  script,
  scopes,
  _,
  trace: A_ANY[]
) => {
  return execute(script.arguments[0], scopes, trace);
};

export { processComma };
