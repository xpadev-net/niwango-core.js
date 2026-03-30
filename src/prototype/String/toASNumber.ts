import type { PrototypeStringFunction } from "@/prototype/String/index";

const processToASNumber: PrototypeStringFunction = (
  _script,
  _scopes,
  object,
) => {
  const n = Number(object);
  return Number.isNaN(n) ? 0 : n;
};

export { processToASNumber };
