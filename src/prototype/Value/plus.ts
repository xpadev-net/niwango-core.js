import { A_ANY } from "@/@types";
import { resolvePrototype } from "@/context";
import { UnaryPlus } from "@/operators";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processPlus: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const toASNumber = resolvePrototype(getType(object), "toASNumber");
  if (!toASNumber) throw new Error();
  return UnaryPlus(toASNumber(script, scopes, object, trace));
};

export { processPlus };
