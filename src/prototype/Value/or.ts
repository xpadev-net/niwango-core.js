import { A_ANY } from "@/@types";
import { execute, resolvePrototype } from "@/context";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processOr: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const toASBoolean = resolvePrototype(getType(object), "toASBoolean");
  if (!toASBoolean) throw new Error();
  if (toASBoolean(script, scopes, object, trace)) {
    return object;
  }
  return execute(script.arguments[0], scopes, trace);
};

export { processOr };
