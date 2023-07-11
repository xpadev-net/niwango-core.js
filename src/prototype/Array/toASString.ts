import { PrototypeArrayFunction } from "@/prototype/Array/index";
import { resolvePrototype } from "@/context";
import { getType } from "@/prototype/getType";

const processToASString: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace
) => {
  return (
    "<[" +
    object
      .map((val) => {
        const toASString = resolvePrototype(getType(val), "toASString");
        if (!toASString) throw new Error();
        return toASString(script, scopes, val, trace);
      })
      .join(",") +
    "]>"
  );
};

export { processToASString };
