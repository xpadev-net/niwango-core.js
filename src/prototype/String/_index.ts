import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { PrototypeStringFunction } from "@/prototype/String/index";

const processIndex: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const index = execute(script.arguments[0], scopes, trace);
  return object[Number(index)];
};

export { processIndex };
