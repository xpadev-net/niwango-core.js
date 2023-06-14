import { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import { IrFunction } from "@/@types/functions";
import { argumentParser } from "@/context";

const processDistance: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _,
  trace: A_ANY[]
) => {
  const args = argumentParser(
    script.arguments,
    scopes,
    ["x1", "y1", "x2", "y2"],
    trace
  );
  return Math.sqrt(
    Math.pow(Number(args.x2) - Number(args.x1), 2) +
      Math.pow(Number(args.y2) - Number(args.y1), 2)
  );
};

export { processDistance };
