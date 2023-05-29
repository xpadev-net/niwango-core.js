import { initConfig } from "@/config";
import { initDefinedFunctions, initPrototypeScope } from "@/context";
import { initExecute } from "@/executor";
import { initResolvePrototype } from "@/prototype/resolve";
import { initArgumentParser, initAssign, initGetName } from "@/utils";

const initCore = () => {
  initExecute();
  initResolvePrototype();
  initPrototypeScope();
  initDefinedFunctions();
  initGetName();
  initArgumentParser();
  initAssign();
  initConfig();
};

export { initCore };
