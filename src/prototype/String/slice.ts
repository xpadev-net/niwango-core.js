import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { PrototypeStringFunction } from "@/prototype/String/index";

const processSlice: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const startIndex = execute(script.arguments[0], scopes, trace);
  const length = execute(script.arguments[1], scopes, trace);
  if (typeof length !== "undefined") {
    return object.slice(
      Number(startIndex),
      Number(startIndex) + Number(length)
    );
  }
  return object.slice(Number(startIndex));
};

export { processSlice };
