import type { A_CallExpression } from "@/@types";
import { resolvePrototype } from "@/context";
import { getType } from "@/prototype/getType";

const funcMap = {
  boolean: "toASBoolean",
  number: "toASNumber",
  string: "toASString",
};

type Map = {
  boolean: boolean;
  number: number;
  string: string;
};

const format = <T extends "boolean" | "number" | "string">(
  value: unknown,
  to: T,
): Map[T] => {
  if (value === null || value === undefined) {
    if (to === "boolean") return false as Map[T];
    if (to === "number") return 0 as Map[T];
    if (to === "string") return "<nil>" as Map[T];
  }
  const formatFunc = resolvePrototype(getType(value), funcMap[to]);
  if (!formatFunc) throw new Error(`Cannot convert ${getType(value)} to ${to}`);
  return formatFunc({} as A_CallExpression, [], value, []) as Map[T];
};

export { format };
