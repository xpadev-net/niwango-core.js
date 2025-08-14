import type { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import type { IrFunction } from "@/@types/functions";
import { argumentParser } from "@/context";
import { format } from "@/utils/format";

const processDistance: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _,
  trace: A_ANY[],
) => {
  const args = argumentParser(
    script.arguments,
    scopes,
    ["x1", "y1", "x2", "y2"],
    trace,
  );
  return Math.sqrt(
    (format(args.x2, "number") - format(args.x1, "number")) ** 2 +
      (format(args.y2, "number") - format(args.y1, "number")) ** 2,
  );
};

export { processDistance };
