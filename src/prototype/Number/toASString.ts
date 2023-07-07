import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processToASString: PrototypeNumberFunction = (
  _script,
  _scopes,
  object
) => {
  return `${object}`;
};

export { processToASString };
