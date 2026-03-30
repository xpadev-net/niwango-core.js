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

export { sprintf };
