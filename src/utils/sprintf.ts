import { format } from "@/utils/format";

const sprintf = (template: string, args: unknown[]): string => {
  let argIndex = 0;
  return template.replace(/%([%sdxXf])/g, (match, specifier: string) => {
    if (specifier === "%") return "%";
    if (argIndex >= args.length) return match;
    const arg = args[argIndex++];
    if (specifier === "s") {
      return format(arg, "string");
    }
    const num = format(arg, "number");
    switch (specifier) {
      case "d":
        return Number.isFinite(num) ? String(Math.trunc(num)) : "0";
      case "f":
        return Number.isFinite(num) ? String(num) : "0";
      case "x":
        return Number.isFinite(num) ? Math.trunc(num).toString(16) : "0";
      case "X":
        return Number.isFinite(num)
          ? Math.trunc(num).toString(16).toUpperCase()
          : "0";
      default:
        return match;
    }
  });
};

export { sprintf };
