import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import { format } from "@/utils/format";

const processProduct: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.reduce<number>((pv, val) => pv * format(val, "number"), 1);
};

export { processProduct };
