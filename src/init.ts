import { initConfig } from "@/config";
import { initDefinedFunctions, initPrototypeScope } from "@/context";
import { initExecute } from "@/executor";
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
};

export { initCore, resetCore };
