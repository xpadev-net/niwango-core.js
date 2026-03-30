import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

const sprintf = (template: string, args: unknown[]): string => {
  let argIndex = 0;
  return template.replace(/%([%sdxXf])/g, (match, specifier: string) => {
    if (specifier === "%") return "%";
    if (argIndex >= args.length) return match;
    const arg = args[argIndex++];
    switch (specifier) {
      case "s":
        return format(arg, "string");
      case "d":
        return String(Math.floor(format(arg, "number")));
      case "f":
        return String(format(arg, "number"));
      case "x":
        return Math.floor(format(arg, "number")).toString(16);
      case "X":
        return Math.floor(format(arg, "number")).toString(16).toUpperCase();
      default:
        return match;
    }
  });
};

const processModulo: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (!Array.isArray(value)) return null;
  return sprintf(object, value);
};

export { processModulo };
