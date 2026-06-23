import type { Execute } from "@/@types/execute";
import { execute, prototypeScope } from "@/context";
import { initCore } from "@/init";
import { parseScript } from "@/parser/parse";

initCore();
if (!globalThis.structuredClone) {
  globalThis.structuredClone = function structuredClone<T = unknown>(
    objectToClone: T,
  ) {
    return JSON.parse(JSON.stringify(objectToClone)) as T;
  };
}
/**
 * テスト用サンドボックス
 * @param niwango
 */
const run = (niwango: string, options?: Parameters<Execute>[3]) => {
  const globalScope = {};
  const environmentScope = {
    chat: undefined,
    commentColor: null, //0xffffff
    commentPlace: null, //naka
    commentSize: null, //medium
    commentInvisible: null, //false
    commentReverse: null, //0
    defaultSage: false, //false
    postDisabled: null, //false
    seekDisabled: null, //false
    isLoaded: true, //true
    isWide: null, //false
    lastVideo: "sm1", //sm1
  };
  const ast = parseScript(niwango, "jest");
  return execute(
    ast,
    [globalScope, environmentScope, prototypeScope],
    [ast],
    options,
  );
};
export { run };
