import type { Execute } from "@/@types/execute";
import {
  appendDefinedFunctions,
  appendResultHook,
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
import {
  ParserInputLimitError,
  ParserRecoveryLimitError,
  parseScript,
} from "@/parser/parse";
import { format } from "@/utils/format";

import { SyntaxError as PeggySyntaxError, parse } from "./parser/parser";

initCore();

const utils = {
  argumentParser,
  getName,
  assign,
  resolvePrototype,
};

const executePublic: Execute = (
  script,
  scopes,
  trace,
  options = { catch: true },
) => execute(script, scopes, trace, options);

class NiwangoCore {
  static execute = executePublic;
  static utils = utils;
  static resetCore = resetCore;
  static parseScript = parseScript;
  static parse = parse;
  static PeggySyntaxError = PeggySyntaxError;
  static ParserInputLimitError = ParserInputLimitError;
  static ParserRecoveryLimitError = ParserRecoveryLimitError;
  static appendDefinedFunctions = appendDefinedFunctions;
  static appendResultHook = appendResultHook;
  static setIsWide = setIsWide;
  static format = format;
  static errors = Errors;
  static prototypeScope = prototypeScope;
  static default = NiwangoCore;
}

export default NiwangoCore;

export type * from "@/@types";
