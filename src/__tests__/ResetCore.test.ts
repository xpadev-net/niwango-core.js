import { afterEach, describe, expect, test } from "vitest";
import type { PrototypeFunction } from "@/@types/prototype";
import NiwangoCore from "@/main";

const executePublic = (niwango: string) => {
  const ast = NiwangoCore.parseScript(niwango, "jest");
  return NiwangoCore.execute(
    ast,
    [{}, {}, NiwangoCore.prototypeScope],
    [ast],
    {},
  );
};

describe("resetCore public context", () => {
  afterEach(() => {
    NiwangoCore.resetCore();
  });

  test("keeps public prototypeScope connected to runtime resolution after reset", () => {
    const publicScope = NiwangoCore.prototypeScope;

    NiwangoCore.resetCore();
    NiwangoCore.prototypeScope.Number.afterReset = (() => {
      return "fresh";
    }) as PrototypeFunction<number>;

    expect(NiwangoCore.prototypeScope).toBe(publicScope);
    expect(executePublic("(1).afterReset")).toBe("fresh");
  });

  test("keeps captured prototype categories live across repeated resets", () => {
    const publicScope = NiwangoCore.prototypeScope;
    const numberPrototype = NiwangoCore.prototypeScope.Number;

    NiwangoCore.resetCore();
    NiwangoCore.resetCore();
    numberPrototype.afterRepeatedReset = (() => {
      return "still current";
    }) as PrototypeFunction<number>;

    expect(NiwangoCore.prototypeScope).toBe(publicScope);
    expect(NiwangoCore.prototypeScope.Number).toBe(numberPrototype);
    expect(executePublic("(1).afterRepeatedReset")).toBe("still current");
  });

  test("preserves built-in prototypes after reset", () => {
    NiwangoCore.resetCore();

    expect(executePublic("[1,2,3].sum")).toBe(6);
  });
});
