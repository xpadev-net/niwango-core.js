import type { A_ANY, T_scope } from "@/@types/ast";

/**
 * 予期していない型が渡された際に発生するエラー
 */
class InvalidTypeError extends Error {
  ASTName: string;
  ast: A_ANY;
  scopes: T_scope[];
  trace?: A_ANY[];
  constructor(
    message: string,
    ast: A_ANY,
    scopes: T_scope[],
    options: { trace?: A_ANY[]; cause?: unknown } = {},
  ) {
    super("InvalidTypeError", { cause: options.cause });
    this.message = message;
    this.ASTName = ast.type;
    this.ast = ast;
    this.scopes = scopes;
    this.trace = options.trace;
  }
}
InvalidTypeError.prototype.name = "InvalidTypeError";
export { InvalidTypeError };
