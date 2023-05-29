const time = new Date().getTime();
import { IrFunction } from "@/@types/functions";

const processPlayStartTime: IrFunction = () => {
  return time;
};

export { processPlayStartTime };
