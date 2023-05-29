import { execute } from "@/context";
import { Multiplication } from "@/operators";
import { PrototypeStringFunction } from "@/prototype/String/index";

const processMultiply: PrototypeStringFunction = (script, scopes, object) => {
  const repeatCount = execute(script.arguments[0], scopes);
  return Multiplication(object, repeatCount);
};

export { processMultiply };
