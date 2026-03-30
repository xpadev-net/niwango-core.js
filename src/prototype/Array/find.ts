import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { LooseEquality } from "@/operators";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processFind: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const target = execute(script.arguments[0], scopes, trace);
  return object.findIndex((item) => LooseEquality(item, target));
};

export { processFind };
