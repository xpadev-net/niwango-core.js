import { initConfig } from "@/config";
import {
  initDefinedFunctions,
  initPrototypeScope,
  initResultHook,
} from "@/context";
import { initExecute } from "@/executor";
import { resetPlayStartTime } from "@/functions/playStartTime";
import { initResolvePrototype } from "@/prototype/resolve";
import { initArgumentParser, initAssign, initGetName } from "@/utils";

const initCore = () => {
  initResolvePrototype();
  initGetName();
  initArgumentParser();
  initAssign();
  initConfig();
  initExecute();
};

const resetCore = () => {
  initDefinedFunctions();
  initPrototypeScope();
  initResultHook();
  resetPlayStartTime();
};

export { initCore, resetCore };
