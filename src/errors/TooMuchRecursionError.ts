import type { A_ANY, T_scope } from "@/@types/ast";

/**
 * 再帰の深さが許容される上限を超えた際に発生するエラー
 */
class TooMuchRecursionError extends Error {
  ASTName: string;
  ast: A_ANY;
  scopes: T_scope[];
  constructor(
    ast: A_ANY,
    scopes: T_scope[],
    options: { cause?: unknown } = {},
  ) {
    super("TooMuchRecursionError", { cause: options.cause });
    this.ASTName = ast.type;
    this.ast = ast;
    this.scopes = scopes;
  }
}
TooMuchRecursionError.prototype.name = "TooMuchRecursionError";

export { TooMuchRecursionError };
