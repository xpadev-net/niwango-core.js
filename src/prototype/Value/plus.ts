import { resolvePrototype } from "@/context";
import { UnaryPlus } from "@/operators";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processPlus: PrototypeValueFunction = (script, scopes, object) => {
  const toASNumber = resolvePrototype(getType(object), "toASNumber");
  if (!toASNumber) throw new Error();
  return UnaryPlus(toASNumber(script, scopes, object));
};

export { processPlus };
