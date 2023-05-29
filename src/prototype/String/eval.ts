import { execute } from "@/context";
import { parseScript } from "@/parser/parse";
import { PrototypeStringFunction } from "@/prototype/String/index";

const processEval: PrototypeStringFunction = (_script, scopes, object) => {
  try {
    const script = parseScript(object, "[eval]");
    return execute(script, scopes);
  } catch (e) {
    return undefined;
  }
};

export { processEval };
