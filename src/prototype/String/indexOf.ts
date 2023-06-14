import { execute } from "@/context";
import { PrototypeStringFunction } from "@/prototype/String/index";
import { A_ANY } from "@/@types";

const processIndexOf: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const searchValue = execute(script.arguments[0], scopes, trace);
  const fromIndex = execute(script.arguments[1], scopes, trace);
  if (typeof fromIndex !== undefined) {
    return object.indexOf(`${searchValue}`, Number(fromIndex));
  }
  return object.indexOf(`${searchValue}`);
};

export { processIndexOf };
