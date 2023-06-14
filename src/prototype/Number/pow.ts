import { execute } from "@/context";
import { PrototypeNumberFunction } from "@/prototype/Number/index";
import { A_ANY } from "@/@types";

const processPow: PrototypeNumberFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const exponent = execute(script.arguments[0], scopes, trace);
  return Math.pow(object, Number(exponent));
};

export { processPow };
