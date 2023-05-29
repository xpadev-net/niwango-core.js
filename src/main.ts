import { appendDefinedFunctions, execute, setIsWide } from "@/context";
import { initCore } from "@/init";
import { parseScript } from "@/parser/parse";

class NiwangoCore {
  static execute = execute;
  static initCore = initCore;
  static parseScript = parseScript;
  static appendDefinedFunctions = appendDefinedFunctions;
  static setIsWide = setIsWide;
  static default = NiwangoCore;
}

export default NiwangoCore;
