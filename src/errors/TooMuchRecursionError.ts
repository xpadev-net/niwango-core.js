import type { A_ANY, T_scope } from "@/@types/ast";

/**
 * 未実装の関数や機能を呼び出したときに発生するエラー
 */
class TooMuchRecursionError extends Error {
  ASTName: string;
  ast: A_ANY;
  scopes: T_scope[];
  constructor(
    ast: A_ANY,
    scopes: T_scope[],
    options: { [key: string]: unknown } = {},
  ) {
    super("TooMuchRecursionError", options);
    this.ASTName = ast.type;
    this.ast = ast;
    this.scopes = scopes;
  }
}
TooMuchRecursionError.prototype.name = "TooMuchRecursionError";
export { TooMuchRecursionError };
