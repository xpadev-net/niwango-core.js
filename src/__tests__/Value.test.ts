import { describe, expect, test } from "vitest";
import { run } from "@/testUtils";

describe("Value.prototype", () => {
  test("add", () => {
    expect(run(`'hello'.add("world")`)).toBe("helloworld");
    expect(run(`100.add(100)`)).toBe(200);
    expect(run(`'aiueo'.add(100)`)).toBe("aiueo100");
  });
  test("alternative", () => {
    expect(run(`i=0;true.alternative(then:i=1,else:i=2);i`)).toBe(1);
    expect(run(`i=0;false.alternative(then:i=1,else:i=2);i`)).toBe(2);
    expect(run(`i=0;true.alt(then:i=1,else:i=2);i`)).toBe(1);
    expect(run(`i=0;false.alt(then:i=1,else:i=2);i`)).toBe(2);
  });
  test("compare", () => {
    expect(run(`1.compare(1)`)).toBe(0);
    expect(run(`1.compare(0)`)).toBe(1);
    expect(run(`1.compare(2)`)).toBe(-1);
  });
  test("divide", () => {
    expect(run(`10.divide(2)`)).toBe(5);
  });
  test("equals", () => {
    expect(run(`10.equals(10)`)).toBe(true);
    expect(run(`10.equals(5)`)).toBe(false);
  });
  test("fallback hashCode", () => {
    expect(run(`({}).hashCode()`)).toBe(0);
    expect(run(`true.hashCode`)).toBe(0);
  });
  test("legacy hashCore alias", () => {
    expect(run(`({}).hashCore()`)).toBe(0);
    expect(run(`false.hashCore`)).toBe(0);
  });
  test("minus", () => {
    expect(run(`10.minus`)).toBe(-10);
    expect(run(`-5.minus`)).toBe(5);
  });
  test("dynamic call", () => {
    expect(run(`def(f(a,b),a+b); 0.call("f",1,2)`)).toBe(3);
    expect(run(`def(f(a,b),(a+":"+b)); 0.call("f",b:"B",a:"A")`)).toBe("A:B");
    expect(run(`def(f(),"ok"); 0.call("f")`)).toBe("ok");
    expect(run(`def(f(a,b),a+b); 0.sendMessage("f",1,2)`)).toBe(3);
    expect(run(`def(f(a,b),(a+":"+b)); 0.sendMessage("f",b:"B",a:"A")`)).toBe(
      "A:B",
    );
  });
});
