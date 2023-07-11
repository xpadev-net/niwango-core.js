import { run } from "@/testUtils";

describe("Bool.prototype", () => {
  test("raw", () => {
    expect(run(`i=false;i.raw`)).toBe(false);
    expect(run(`i=true;i.raw`)).toBe(true);
  });

  test("toASNumber", () => {
    expect(run(`i=false;i.toASNumber`)).toBe(0);
    expect(run(`i=true;i.toASNumber`)).toBe(1);
  });

  test("toASString", () => {
    expect(run(`i=false;i.toASString`)).toBe("false");
    expect(run(`i=true;i.toASString`)).toBe("true");
  });
});
