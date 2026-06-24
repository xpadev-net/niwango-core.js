import type { A_ANY, T_scope } from "@/@types/ast";
import { ResourceLimitError } from "@/errors/ResourceLimitError";

/**
 * 再帰呼び出しの深さが制限を超えたときに発生するエラー
 */
class TooMuchRecursionError extends ResourceLimitError {
  constructor(
    ast: A_ANY,
    scopes: T_scope[],
    limit: number,
    actual: number,
    options: { [key: string]: unknown } = {},
  ) {
    super("recursion depth", limit, actual, ast, scopes, options);
  }
}
TooMuchRecursionError.prototype.name = "TooMuchRecursionError";
export { TooMuchRecursionError };
