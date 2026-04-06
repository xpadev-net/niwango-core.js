import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { normalizeStringIndex } from "@/prototype/String/_index";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

const processIndexOf: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const searchValue = execute(script.arguments[0], scopes, trace);
  const fromIndex = execute(script.arguments[1], scopes, trace);
  if (typeof fromIndex !== "undefined") {
    let fi = format(fromIndex, "number");
    if (Number.isNaN(fi)) fi = 0;
    else if (!Number.isFinite(fi)) fi = fi > 0 ? object.length : 0;
    fi = normalizeStringIndex(fi, object.length);
    return object.indexOf(`${searchValue}`, fi);
  }
  return object.indexOf(`${searchValue}`);
};

export { processIndexOf };
