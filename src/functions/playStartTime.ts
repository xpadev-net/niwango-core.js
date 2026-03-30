import type { IrFunction } from "@/@types/functions";

let time: number | null = null;

const processPlayStartTime: IrFunction = () => {
  if (time === null) time = Date.now();
  return time;
};

const resetPlayStartTime = () => {
  time = null;
};

export { processPlayStartTime, resetPlayStartTime };
