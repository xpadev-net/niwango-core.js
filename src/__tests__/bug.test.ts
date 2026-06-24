import { expect, test } from "vitest";
import { run } from "@/testUtils";

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
