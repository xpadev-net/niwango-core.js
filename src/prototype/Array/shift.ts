import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processShift: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.shift();
};

export { processShift };
