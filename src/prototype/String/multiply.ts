import { execute } from "@/context";
import { Multiplication } from "@/operators";
import { PrototypeStringFunction } from "@/prototype/String/index";
import { A_ANY } from "@/@types";

const processMultiply: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const repeatCount = execute(script.arguments[0], scopes, trace);
  return Multiplication(object, repeatCount);
};

export { processMultiply };
