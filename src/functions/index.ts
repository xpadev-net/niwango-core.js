import { IrFunctions } from "@/@types/functions";
import { processAt } from "@/functions/At";
import { processPlayStartTime } from "@/functions/playStartTime";

import { processDistance } from "./distance";
import { processDump } from "./dump";
import { processIf } from "./if";
import { processScreenHeight, processScreenWidth } from "./screen";
import { processTimethis } from "./timethis";
import { processWhileKari } from "./while_kari";

const functions: IrFunctions = {
  dump: processDump,
  while_kari: processWhileKari,
  if: processIf,
  distance: processDistance,
  screenWidth: processScreenWidth,
  screenHeight: processScreenHeight,
  playStartTime: processPlayStartTime,
  timethis: processTimethis,
  "@": processAt,
};

export { functions };
