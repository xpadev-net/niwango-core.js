import { A_ANY, A_CallExpression } from "@/@types/ast";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { PrototypeValueFunction } from "@/prototype/Value/index";

//todo: これであっているか調査
const processCall: PrototypeValueFunction = (
  script,
  scopes,
  _,
  trace: A_ANY[]
) => {
  const functionNameAst = script.arguments[0];
  if (!functionNameAst)
    throw new InvalidTypeError("function name must be exist", script, scopes);
  const functionName = execute(script.arguments[0], scopes, trace);
  if (typeof functionName !== "string")
    throw new InvalidTypeError(
      "typeof function name must be string",
      script,
      scopes
    );
  const newScript: A_CallExpression = {
    type: "CallExpression",
    callee: {
      type: "Raw",
      value: functionName,
    },
    arguments: script.arguments[1] ? [script.arguments[1]] : [],
  };
  return execute(newScript, scopes, trace);
};

export { processCall };
