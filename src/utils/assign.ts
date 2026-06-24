import type { A_ANY, T_scope } from "@/@types/ast";
import { setAssign } from "@/context";
import { resolveReference } from "@/utils/reference";

/**
 * 変数に代入する関数
 * @param target
 * @param value
 * @param scopes
 */
const assign = (
  target: A_ANY,
  value: unknown,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  if (scopes.length < 1) {
    return;
  }
  try {
    resolveReference(target, scopes, trace)?.set(value);
  } catch (e) {
    if (e instanceof Error) {
      console.error(
        `[assign] ${e.name}: ${e.message}`,
        target,
        value,
        scopes,
        trace,
      );
    }
  }
};

const initAssign = () => {
  setAssign(assign);
};

export { initAssign };
