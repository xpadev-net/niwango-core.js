import { resolvePrototype } from "@/context";
import { UnaryNegation } from "@/operators";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";
import { A_ANY } from "@/@types";

const processMinus: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const toASNumber = resolvePrototype(getType(object), "toASNumber");
  if (!toASNumber) throw new Error();
  return UnaryNegation(toASNumber(script, scopes, object, trace));
};

export { processMinus };
