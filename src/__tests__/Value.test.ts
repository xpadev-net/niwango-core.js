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
  test("minus", () => {
    expect(run(`10.minus`)).toBe(-10);
    expect(run(`-5.minus`)).toBe(5);
  });

  test("while_kari has max loop guard", () => {
    expect(run("i=0;true.while_kari(true,i++);i")).toBe(10000);
  });
});
