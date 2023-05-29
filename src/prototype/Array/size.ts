import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processSize: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.length;
};

export { processSize };
