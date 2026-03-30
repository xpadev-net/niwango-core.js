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
  const formatFunc = resolvePrototype(getType(value), funcMap[to]);
  if (!formatFunc) throw new Error(`Cannot convert ${getType(value)} to ${to}`);
  return formatFunc({} as A_CallExpression, [], value, []) as Map[T];
};

export { format };
