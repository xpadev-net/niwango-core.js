import { IrFunction } from "@/@types/functions";
import { config } from "@/config";
import { isWide } from "@/context";

const processScreenWidth: IrFunction = () => {
  return config.stageWidth[isWide ? "full" : "default"];
};

const processScreenHeight: IrFunction = () => {
  return config.stageHeight;
};

export { processScreenHeight, processScreenWidth };
