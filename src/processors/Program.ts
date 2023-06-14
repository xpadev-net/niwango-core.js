import { A_ANY, A_Program, T_scope } from "@/@types/ast";
import { execute } from "@/context";

/**
 * 含まれる式すべてを実行する
 * @param script
 * @param scopes
 */
const processProgram = (
  script: A_Program,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  return script.body.reduce(
    (_, item) => execute(item, scopes, trace),
    undefined as unknown
  );
};

export { processProgram };
