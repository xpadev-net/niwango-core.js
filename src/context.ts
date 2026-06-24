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

type PrototypeScopeKey =
  | "Array"
  | "Bool"
  | "Number"
  | "Object"
  | "String"
  | "Value";

type PrototypeScope = {
  [key in PrototypeScopeKey]: {
    [key: string]: unknown;
  };
};

const prototypeScopeKeys: PrototypeScopeKey[] = [
  "Array",
  "Bool",
  "Number",
  "Object",
  "String",
  "Value",
];

const clearMutableObject = (object: { [key: string]: unknown }) => {
  for (const key of Object.keys(object)) {
    delete object[key];
  }
};

const isPrototypeScopeKey = (key: string): key is PrototypeScopeKey => {
  return prototypeScopeKeys.includes(key as PrototypeScopeKey);
};

const prototypeScope: PrototypeScope = {
  Array: {},
  Bool: {},
  Number: {},
  Object: {},
  String: {},
  Value: {},
};

const initPrototypeScope = () => {
  const prototypeScopeRecord = prototypeScope as Record<string, unknown>;
  for (const key of Object.keys(prototypeScopeRecord)) {
    if (!isPrototypeScopeKey(key)) {
      delete prototypeScopeRecord[key];
    }
  }
  for (const key of prototypeScopeKeys) {
    clearMutableObject(prototypeScope[key]);
  }
};

const definedFunctions: { [key: string]: IrFunction } = {};

const initDefinedFunctions = () => {
  clearMutableObject(definedFunctions);
};

const appendDefinedFunctions = (name: string, func: IrFunction) => {
  definedFunctions[name] = func;
};

let isWide = false;

const setIsWide = (val: boolean) => {
  isWide = val;
};

const resultHook: ((input: unknown) => unknown)[] = [];

const appendResultHook = (func: (input: unknown) => unknown) => {
  resultHook.push(func);
};

const initResultHook = () => {
  resultHook.length = 0;
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
