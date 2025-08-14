import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { format } from "@/utils/format";

const processAnd: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  if (!format(object, "boolean")) {
    return object;
  }
  return execute(script.arguments[0], scopes, trace);
};

export { processAnd };
