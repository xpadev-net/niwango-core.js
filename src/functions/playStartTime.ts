const time = Date.now();

import type { IrFunction } from "@/@types/functions";

const processPlayStartTime: IrFunction = () => {
  return time;
};

export { processPlayStartTime };
