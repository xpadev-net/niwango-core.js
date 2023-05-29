import { A_CallExpression, T_scope } from "@/@types/ast";
import { IrFunction } from "@/@types/functions";
import { execute } from "@/context";

const processTimethis: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[]
) => {
  console.time("timethis");
  const result = execute(script.arguments[0], scopes);
  console.timeEnd("timethis");
  return result;
};

export { processTimethis };
