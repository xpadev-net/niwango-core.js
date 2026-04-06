import type { PrototypeStringFunction } from "@/prototype/String/index";

const processHashCode: PrototypeStringFunction = (_script, _scopes, object) => {
  let seed = 0;
  for (let i = 0; i < object.length; i++) {
    seed = (Math.imul(seed, 31) + object.charCodeAt(i)) >>> 0;
  }
  return seed >>> 0;
};

export { processHashCode };
