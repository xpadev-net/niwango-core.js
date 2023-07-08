import { A_ANY } from "@/@types";
import { resolvePrototype } from "@/context";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processNot: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const toASBoolean = resolvePrototype(getType(object), "toASBoolean");
  if (!toASBoolean) throw new Error();
  return !toASBoolean(script, scopes, object, trace);
};

export { processNot };
