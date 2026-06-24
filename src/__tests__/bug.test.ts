import { expect, test } from "vitest";
import type { A_ANY } from "@/@types/ast";
import { execute, prototypeScope } from "@/context";
import { run } from "@/testUtils";

const runAst = (body: A_ANY[], globalScope: Record<string, unknown>) => {
  return execute(
    {
      type: "Program",
      body,
    },
    [globalScope, {}, prototypeScope],
    body,
  );
};

test("bug:sm13570088", () => {
  expect(
    run(
      `def(car(c),(c==nil).alt(nil,c[1].car));obj=[0,[4]];obj[1].car="huga";car(obj)`,
    ),
  ).toBe("huga");

  expect(run(`fn=[];fn[1]={};fn[1].def(call(a),a);fn[1]("test")`)).toBe("test");
});

test("bug:sm11605742", () => {
  expect(run(`return = "test";return`)).toBe("test");
});

test("local nil argument shadows outer slot", () => {
  expect(run(`x="outer";def(read(x),x);read(nil)`)).toBeUndefined();
});

test("assignment targets local nil argument instead of outer slot", () => {
  expect(run(`x="outer";def(write(x),(x="inner"));write(nil);x`)).toBe("outer");
});

test("plain member assignment does not execute the old defined function", () => {
  expect(
    run("obj={};hit=0;obj.def(method(),hit++);obj.method=1;hit+':'+obj.method"),
  ).toBe("0:1");
});

test("computed assignment target key is evaluated once", () => {
  expect(run("i=0;a=[0,0];a[i++]=5;i+':'+a[0]")).toBe("1:5");
});

test("compound and update member targets reuse one resolved reference", () => {
  expect(run("i=0;a=[1];a[i++]+=4;i+':'+a[0]")).toBe("1:5");
  expect(run("i=0;a=[1];a[i++]++;i+':'+a[0]")).toBe("1:2");
});

test("compound member assignment reads defined function value once", () => {
  expect(
    run(
      "obj={};calls=0;obj.def(value(),calls++;1);obj.value+=4;calls+':'+obj.value",
    ),
  ).toBe("1:5");
});

test("logical assignment short-circuits the right side", () => {
  for (const [operator, value] of [
    ["&&=", 0],
    ["||=", 1],
    ["??=", 1],
  ] as const) {
    const globalScope = { hit: 0, value };
    expect(
      runAst(
        [
          {
            type: "AssignmentExpression",
            operator,
            left: {
              type: "Identifier",
              name: "value",
            },
            right: {
              type: "UpdateExpression",
              operator: "++",
              argument: {
                type: "Identifier",
                name: "hit",
              },
              prefix: false,
            },
          },
        ],
        globalScope,
      ),
    ).toBe(value);
    expect(globalScope).toEqual({ hit: 0, value });
  }
});

test("logical assignment parses and executes from source", () => {
  expect(run("value=0;hit=0;value ||= (hit=2);hit+':'+value")).toBe("2:2");
  expect(run("value=1;hit=0;value ||= (hit=2);hit+':'+value")).toBe("0:1");

  expect(run("value=1;hit=0;value &&= (hit=2);hit+':'+value")).toBe("2:2");
  expect(run("value=0;hit=0;value &&= (hit=2);hit+':'+value")).toBe("0:0");

  expect(run("value=nil;hit=0;value ??= (hit=2);hit+':'+value")).toBe("2:2");
  expect(run("value=1;hit=0;value ??= (hit=2);hit+':'+value")).toBe("0:1");
});

test("logical assignment keeps computed member targets single-pass", () => {
  for (const [script, expected] of [
    ["i=0;hit=0;a=[1];a[i++] ||= (hit=2);i+':'+hit+':'+a[0]", "1:0:1"],
    ["i=0;hit=0;a=[0];a[i++] ||= (hit=2);i+':'+hit+':'+a[0]", "1:2:2"],
    ["i=0;hit=0;a=[0];a[i++] &&= (hit=2);i+':'+hit+':'+a[0]", "1:0:0"],
    ["i=0;hit=0;a=[1];a[i++] &&= (hit=2);i+':'+hit+':'+a[0]", "1:2:2"],
    ["i=0;hit=0;a=[1];a[i++] ??= (hit=2);i+':'+hit+':'+a[0]", "1:0:1"],
    ["i=0;hit=0;a=[nil];a[i++] ??= (hit=2);i+':'+hit+':'+a[0]", "1:2:2"],
  ] as const) {
    expect(run(script)).toBe(expected);
  }
});
