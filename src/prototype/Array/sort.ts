import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processSort: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.sort();
};

export { processSort };
