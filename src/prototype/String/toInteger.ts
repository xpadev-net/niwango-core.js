import type { PrototypeStringFunction } from "@/prototype/String/index";

const processToInteger: PrototypeStringFunction = (
  _script,
  _scopes,
  object,
) => {
  if (object.match(/^0[0-7]+$/)) {
    return parseInt(object, 8);
  }
  return parseInt(object, 10);
};

export { processToInteger };
