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
    expect(run(`"ニコニコ動画".hashCode`)).toBe(137861526);
  });

  test("index", () => {
    expect(run(`str='ニコニコ動画'; str.index(4)`)).toBe("動");
    expect(run(`str='ニコニコ動画'; str.index(6)`)).toBe("");
    expect(run(`str='ニコニコ動画'; str.index(7)`)).toBe(null);
    expect(run(`str='ABCDEF'; str.index(-8)`)).toBe("E");
    expect(run(`str='ABCDEF'; str.index(0/0)`)).toBe(null);
    expect(run(`str='ニコニコ動画'; str[4]`)).toBe("動");
  });

  test("indexOf", () => {
    expect(run(`'abcdef'.indexOf('d')`)).toBe(3);
    expect(run(`'abcdef'.indexOf('a', -10)`)).toBe(-1);
    expect(run(`'abcdef'.indexOf('f', -1)`)).toBe(5);
    expect(run(`t1='abcdef';t2='d';check=(t1.indexOf(t2)>=0); check`)).toBe(
      true,
    );
  });

  test("multiply", () => {
    expect(run(`'A'.multiply(2)`)).toBe("AA");
    expect(run(`'A'.multiply(0)`)).toBe("");
    expect(run(`'B'.multiply(10)`)).toBe("BBBBBBBBBB");
    expect(run(`'A'.multiply(-1)`)).toBe(null);
    expect(run(`'A'.multiply('2')`)).toBe(null);
  });

  test("size", () => {
    expect(run(`"ニコニコ動画".size`)).toBe(6);
  });

  test("slice", () => {
    expect(run(`'ABCDEF'.slice(2,2)`)).toBe("CD");
    expect(run(`'ABCDEF'.slice(-4)`)).toBe("CDEF");
    expect(run(`'ABCDEF'.slice(-8)`)).toBe("EF");
    expect(run(`'ABCDEF'.slice(-8,2)`)).toBe("EF");
    expect(run(`'ABCDEF'.slice(6)`)).toBe("");
  });

  test("toASNumber", () => {
    expect(run(`'0777'.toASNumber`)).toBe(0);
    expect(run(`'0.777'.toASNumber`)).toBe(0);
    expect(run(`'aiueo'.toASNumber`)).toBe(0);
    expect(run(`''.toASNumber`)).toBe(0);
    expect(run(`'0xFF'.toASNumber`)).toBe(0);
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
    expect(run(`'0777'.toInteger`)).toBe(777);
    expect(run(`'0.777'.toInteger`)).toBe(0);
    expect(run(`'aiueo'.toInteger`)).toBe(NaN);
    expect(run(`'0xFF'.toInteger`)).toBe(255);
    expect(run(`'0'.toInteger`)).toBe(0);
    expect(run(`'08'.toInteger`)).toBe(8);
    expect(run(`'0778'.toInteger`)).toBe(778);
  });
});
