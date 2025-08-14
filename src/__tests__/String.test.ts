import { describe, expect, test } from "vitest";
import { run } from "@/testUtils";

describe("String.prototype", () => {
  test("basic", () => {
    expect(run(`a = "ニコニコ動画"; b = "で遊ぼう"; c = a + b;c`)).toBe(
      "ニコニコ動画で遊ぼう",
    );
  });

  test("eval", () => {
    expect(run(`"2".eval;`)).toBe(2);
    expect(run(`i=1;"i=2".eval;i`)).toBe(2);
  });

  test("hashCode", () => {
    expect(run(`"".hashCode;`)).toBe(0);
    expect(run(`"ニコニコ動画".hashCode`)).toBe(369505048982);
  });

  test("index", () => {
    expect(run(`str='ニコニコ動画'; str.index(4)`)).toBe("動");
    expect(run(`str='ニコニコ動画'; str[4]`)).toBe("動");
  });

  test("indexOf", () => {
    expect(run(`'abcdef'.indexOf('d')`)).toBe(3);
    expect(run(`t1='abcdef';t2='d';check=(t1.indexOf(t2)>=0); check`)).toBe(
      true,
    );
  });

  test("multiply", () => {
    expect(run(`'A'.multiply(2)`)).toBe("AA");
    expect(run(`'B'.multiply(10)`)).toBe("BBBBBBBBBB");
  });

  test("size", () => {
    expect(run(`"ニコニコ動画".size`)).toBe(6);
  });

  test("slice", () => {
    expect(run(`'ABCDEF'.slice(2,2)`)).toBe("CD");
    expect(run(`'ABCDEF'.slice(-4)`)).toBe("CDEF");
  });

  test("toASNumber", () => {
    expect(run(`'0777'.toASNumber`)).toBe(0);
    expect(run(`'0.777'.toASNumber`)).toBe(0);
    expect(run(`'aiueo'.toASNumber`)).toBe(0);
  });

  test("toASString", () => {
    expect(run(`'0777'.toASString`)).toBe("0777");
    expect(run(`'0.777'.toASString`)).toBe("0.777");
    expect(run(`'aiueo'.toASString`)).toBe("aiueo");
  });

  test("toFloat", () => {
    expect(run(`'2525.96'.toFloat`)).toBe(2525.96);
    expect(run(`'aiueo'.toFloat`)).toBe(NaN);
  });

  test("toInteger", () => {
    expect(run(`'0777'.toInteger`)).toBe(511);
    expect(run(`'0.777'.toInteger`)).toBe(0);
    expect(run(`'aiueo'.toInteger`)).toBe(NaN);
  });
});
