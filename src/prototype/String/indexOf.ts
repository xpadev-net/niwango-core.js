import type { A_ANY } from "@/@types";
import { execute } from "@/context";
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
  if (typeof fromIndex !== undefined) {
    return object.indexOf(`${searchValue}`, format(fromIndex, "number"));
  }
  return object.indexOf(`${searchValue}`);
};

export { processIndexOf };
