import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import { format } from "@/utils/format";

const processSum: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.reduce<number>((pv, val) => pv + format(val, "number"), 0);
};

export { processSum };
