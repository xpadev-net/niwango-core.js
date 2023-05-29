import { baseConfig } from "@/@types/config";

let config: baseConfig;
const initConfig = () => {
  config = {
    stageWidth: {
      default: 512,
      full: 672,
    },
    stageHeight: 384,
    canvasWidth: 672,
    canvasHeight: 384,
  };
};

export { config, initConfig };
