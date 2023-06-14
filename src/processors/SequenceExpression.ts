import { A_ANY, A_SequenceExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";

/**
 * 含まれる式すべてを実行する
 * @param script
 * @param scopes
 */
const processSequenceExpression = (
  script: A_SequenceExpression,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  return script.expressions.reduce(
    (_, arg) => execute(arg, scopes, trace),
    undefined as unknown
  );
};

export { processSequenceExpression };
