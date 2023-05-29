import { initConfig } from "@/config";
import { execute, initDefinedFunctions, initPrototypeScope } from "@/context";
import { initExecute } from "@/executor";
import { initResolvePrototype } from "@/prototype/resolve";
import { initArgumentParser, initAssign, initGetName } from "@/utils";

const initCore = () => {
  initResolvePrototype();
  initPrototypeScope();
  initDefinedFunctions();
  initGetName();
  initArgumentParser();
  initAssign();
  initConfig();
  initExecute();
  console.log(execute);
};

export { initCore };
