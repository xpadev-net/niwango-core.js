import type { IrFunctions } from "@/@types/functions";

import { processAt } from "./At";
import { processDistance } from "./distance";
import { processDump } from "./dump";
import { processIf } from "./if";
import { processPlayStartTime } from "./playStartTime";
import { processReturn } from "./return";
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
  return: processReturn,
};

export { functions };
