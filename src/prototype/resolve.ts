import type { ResolvePrototype, ResolveResult } from "@/@types/prototype";
import { prototypeScope, setResolvePrototype } from "@/context";
import { prototypeArrayFunctions } from "@/prototype/Array";
import { prototypeBoolFunctions } from "@/prototype/Bool";
import { prototypeNumberFunctions } from "@/prototype/Number";
import { prototypeObjectFunctions } from "@/prototype/Object";
import { prototypeStringFunctions } from "@/prototype/String";
import { prototypeValueFunctions } from "@/prototype/Value";
import { getOwnSlot, normalizeSlotKey } from "@/utils/slot";

const resolvePrototype: ResolvePrototype = (type, name) => {
  const key = normalizeSlotKey(name);
  if (key === undefined || typeof key !== "string") {
    return undefined;
  }

  if (type === "object" || type === "array") {
    const objectPrototype = getOwnSlot(prototypeObjectFunctions, key);
    if (objectPrototype) {
      return objectPrototype as ResolveResult;
    }
  }
  if (type === "array") {
    const arrayPrototype = getOwnSlot(prototypeArrayFunctions, key);
    if (arrayPrototype) {
      return arrayPrototype as ResolveResult;
    }
  } else if (type === "string") {
    const stringPrototype = getOwnSlot(prototypeStringFunctions, key);
    if (stringPrototype) {
      return stringPrototype as ResolveResult;
    }
  } else if (type === "boolean") {
    const boolPrototype = getOwnSlot(prototypeBoolFunctions, key);
    if (boolPrototype) {
      return boolPrototype as ResolveResult;
    }
  } else if (type === "number") {
    const numberPrototype = getOwnSlot(prototypeNumberFunctions, key);
    if (numberPrototype) {
      return numberPrototype as ResolveResult;
    }
  }

  const valuePrototype = getOwnSlot(prototypeValueFunctions, key);
  if (valuePrototype) {
    return valuePrototype as ResolveResult;
  }

  if (type === "array") {
    return getOwnSlot(prototypeScope.Array, key) as ResolveResult;
  } else if (type === "string") {
    return getOwnSlot(prototypeScope.String, key) as ResolveResult;
  } else if (type === "boolean") {
    return getOwnSlot(prototypeScope.Bool, key) as ResolveResult;
  } else if (type === "number") {
    return getOwnSlot(prototypeScope.Number, key) as ResolveResult;
  } else if (type === "object") {
    return getOwnSlot(prototypeScope.Object, key) as ResolveResult;
  }
  return undefined;
};

const initResolvePrototype = () => {
  setResolvePrototype(resolvePrototype);
};

export { initResolvePrototype };
