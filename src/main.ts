import {
  appendDefinedFunctions,
  argumentParser,
  assign,
  execute,
  getName,
  prototypeScope,
  resolvePrototype,
  setIsWide,
} from "@/context";
import * as Errors from "@/errors";
import { initCore, resetCore } from "@/init";
import { parseScript } from "@/parser/parse";

initCore();

const utils = {
  argumentParser,
  getName,
  assign,
  resolvePrototype,
};

class NiwangoCore {
  static execute = execute;
  static utils = utils;
  static resetCore = resetCore;
  static parseScript = parseScript;
  static appendDefinedFunctions = appendDefinedFunctions;
  static setIsWide = setIsWide;
  static errors = Errors;
  static prototypeScope = prototypeScope;
  static default = NiwangoCore;
}

export default NiwangoCore;
