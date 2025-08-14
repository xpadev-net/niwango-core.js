import type {
  ArgumentParser,
  Assign,
  Execute,
  GetName,
} from "@/@types/execute";
import type { IrFunction } from "@/@types/functions";
import type { ResolvePrototype } from "@/@types/prototype";

let execute: Execute;

const setExecute = (val: Execute) => {
  execute = val;
};

let argumentParser: ArgumentParser;

const setArgumentParser = (val: ArgumentParser) => {
  argumentParser = val;
};

let getName: GetName;

const setGetName = (val: GetName) => {
  getName = val;
};

let assign: Assign;

const setAssign = (val: Assign) => {
  assign = val;
};

let resolvePrototype: ResolvePrototype;

const setResolvePrototype = (val: ResolvePrototype) => {
  resolvePrototype = val;
};

let prototypeScope: {
  [key in "Array" | "Bool" | "Number" | "Object" | "String" | "Value"]: {
    [key: string]: unknown;
  };
} = {
  Array: {},
  Bool: {},
  Number: {},
  Object: {},
  String: {},
  Value: {},
};

const initPrototypeScope = () => {
  prototypeScope = {
    Array: {},
    Bool: {},
    Number: {},
    Object: {},
    String: {},
    Value: {},
  };
};

let definedFunctions: { [key: string]: IrFunction } = {};

const initDefinedFunctions = () => {
  definedFunctions = {};
};

const appendDefinedFunctions = (name: string, func: IrFunction) => {
  definedFunctions[name] = func;
};

let isWide = false;

const setIsWide = (val: boolean) => {
  isWide = val;
};

let resultHook: ((input: unknown) => unknown)[] = [];

const appendResultHook = (func: (input: unknown) => unknown) => {
  resultHook.push(func);
};

const initResultHook = () => {
  resultHook = [];
};

export {
  appendDefinedFunctions,
  appendResultHook,
  argumentParser,
  assign,
  definedFunctions,
  execute,
  getName,
  initDefinedFunctions,
  initPrototypeScope,
  initResultHook,
  isWide,
  prototypeScope,
  resolvePrototype,
  resultHook,
  setArgumentParser,
  setAssign,
  setExecute,
  setGetName,
  setIsWide,
  setResolvePrototype,
};
