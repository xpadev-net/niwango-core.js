import { expect, test } from "vitest";
import { run } from "@/testUtils";

test("named arguments preserve falsey values before positional arguments", () => {
  expect(run("distance(x1:0, 1, y1:0, x2:3, y2:4)")).toBe(5);
  expect(run(`def(f(a,b),(a+":"+b)); f(a:false,2)`)).toBe("false:2");
  expect(run(`def(f(a,b),(a+":"+b)); f(a:"",2)`)).toBe(":2");
});
