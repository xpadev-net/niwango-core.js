import {
  appendDefinedFunctions,
  execute,
  prototypeScope,
  setIsWide,
} from "@/context";
import { initCore } from "@/init";
import { parseScript } from "@/parser/parse";

initCore();

class NiwangoCore {
  static execute = execute;
  static parseScript = parseScript;
  static appendDefinedFunctions = appendDefinedFunctions;
  static setIsWide = setIsWide;
  static prototypeScope = prototypeScope;
  static default = NiwangoCore;
}

export default NiwangoCore;
