import { A_ANY } from "@/@types";
import { IrFunction } from "@/@types/functions";
import { assign } from "@/context";
import { resolve } from "@/utils";

const processAt: IrFunction = (script, scopes, _, trace: A_ANY[]) => {
  if (!script.arguments[0]) {
    console.error("[call expression] @: at least 1 argument required");
    return;
  }
  assign(
    script.arguments[0],
    resolve({ type: "Identifier", name: "@0" }, scopes),
    scopes,
    trace
  );
};

export { processAt };
