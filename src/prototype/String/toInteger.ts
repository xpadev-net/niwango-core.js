import type { PrototypeStringFunction } from "@/prototype/String/index";

const processToInteger: PrototypeStringFunction = (
  _script,
  _scopes,
  object,
) => {
  if (object.match(/^0x[0-9a-fA-F]+$/)) {
    return parseInt(object, 16);
  }
  if (object.match(/^0[0-7]+$/)) {
    return parseInt(object, 8);
  }
  return parseInt(object, 10);
};

export { processToInteger };
