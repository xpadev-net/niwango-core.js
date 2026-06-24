import type { A_ANY, T_scope } from "@/@types/ast";
import type { Execute } from "@/@types/execute";
import { getResourceLimit } from "@/config";
import { resultHook, setExecute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { ResourceLimitError } from "@/errors/ResourceLimitError";
import { TooMuchRecursionError } from "@/errors/TooMuchRecursionError";
import { processors } from "@/processors";
import typeGuard from "@/typeGuard";

/**
 * ASTを実行する関数
 * @param script
 * @param scopes
 * @param trace
 * @param options
 */
const execute: Execute = (
  script: unknown,
  scopes: T_scope[],
  trace: A_ANY[],
  options: Partial<{ catch: boolean }> = {},
): unknown => {
  if (!script || !typeGuard.AST(script)) return;
  const recursionLimit = getResourceLimit("recursionDepth");
  if (trace.length > recursionLimit) {
    throw new TooMuchRecursionError(
      script,
      scopes,
      recursionLimit,
      trace.length,
    );
  }
  let result: unknown;
  trace = [...trace, script];
  try {
    const processor = processors[script.type];
    if (!processor) throw new NotImplementedError(script, scopes);
    result = processor(script, scopes, trace);
  } catch (e) {
    if (e instanceof ResourceLimitError) throw e;
    if (!options.catch) throw e;
    const err = e as Record<string, unknown>;
    console.log(e, err.ast, err.scopes);
    console.log("trace", trace);
  }
  for (const hook of resultHook) {
    result = hook(result);
  }
  return result;
};

const initExecute = () => {
  setExecute(execute);
};

export { initExecute };
