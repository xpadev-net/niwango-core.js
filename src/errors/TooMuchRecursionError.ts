import type { A_ANY, T_scope } from "@/@types/ast";
import { ResourceLimitError } from "@/errors/ResourceLimitError";

/**
 * 未実装の関数や機能を呼び出したときに発生するエラー
 */
class TooMuchRecursionError extends ResourceLimitError {
  constructor(
    ast: A_ANY,
    scopes: T_scope[],
    limit = 0,
    actual = 0,
    options: { [key: string]: unknown } = {},
  ) {
    super("recursion depth", limit, actual, ast, scopes, options);
  }
}
TooMuchRecursionError.prototype.name = "TooMuchRecursionError";
export { TooMuchRecursionError };
