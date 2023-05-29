import { ResolvePrototype, ResolveResult } from "@/@types/prototype";
import { prototypeScope, setResolvePrototype } from "@/context";
import { prototypeArrayFunctions } from "@/prototype/Array";
import { prototypeBoolFunctions } from "@/prototype/Bool";
import { prototypeNumberFunctions } from "@/prototype/Number";
import { prototypeObjectFunctions } from "@/prototype/Object";
import { prototypeStringFunctions } from "@/prototype/String";
import { prototypeValueFunctions } from "@/prototype/Value";

const resolvePrototype: ResolvePrototype = (type, name) => {
  if (
    (type === "object" || type === "array") &&
    prototypeObjectFunctions[name]
  ) {
    return prototypeObjectFunctions[name] as ResolveResult;
  } else if (type === "array" && prototypeArrayFunctions[name]) {
    return prototypeArrayFunctions[name] as ResolveResult;
  } else if (type === "string" && prototypeStringFunctions[name]) {
    return prototypeStringFunctions[name] as ResolveResult;
  } else if (type === "boolean" && prototypeBoolFunctions[name]) {
    return prototypeBoolFunctions[name] as ResolveResult;
  } else if (type === "number" && prototypeNumberFunctions[name]) {
    return prototypeNumberFunctions[name] as ResolveResult;
  } else if (prototypeValueFunctions[name]) {
    return prototypeValueFunctions[name] as ResolveResult;
  }

  if (type === "array" && prototypeScope.Array[name]) {
    return prototypeScope.Array[name] as ResolveResult;
  } else if (type === "string" && prototypeScope.String[name]) {
    return prototypeScope.String[name] as ResolveResult;
  } else if (type === "boolean" && prototypeScope.Bool[name]) {
    return prototypeScope.Bool[name] as ResolveResult;
  } else if (type === "number" && prototypeScope.Number[name]) {
    return prototypeScope.Number[name] as ResolveResult;
  } else if (type === "object" && prototypeScope.Object[name]) {
    return prototypeScope.Object[name] as ResolveResult;
  }
  return undefined;
};

const initResolvePrototype = () => {
  setResolvePrototype(resolvePrototype);
};

export { initResolvePrototype };
