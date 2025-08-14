import type { PrototypeArrayFunction } from "@/prototype/Array";
import { format } from "@/utils/format";

const processToASString: PrototypeArrayFunction = (
  _script,
  _scopes,
  object,
) => {
  return (
    "<[" +
    object
      .map((val) => {
        return format(val, "string");
      })
      .join(",") +
    "]>"
  );
};

export { processToASString };
