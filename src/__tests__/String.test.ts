import { run } from "@/testUtils";

describe("String.prototype", () => {
  test("basic", () => {
    expect(run(`a = "ニコニコ動画"; b = "で遊ぼう"; c = a + b;return c`)).toBe(
      "ニコニコ動画で遊ぼう"
    );
  });

  test("eval", () => {
    expect(run(`return "return 2".eval;`)).toBe(2);
    expect(run(`i=1;"i=2".eval;return i`)).toBe(2);
  });

  test("hashCode", () => {
    expect(run(`return "".hashCode;`)).toBe(0);
    expect(run(`return "ニコニコ動画".hashCode`)).toBe(369505048982);
  });

  test("index", () => {
    expect(run(`str='ニコニコ動画'; return str.index(4)`)).toBe("動");
    expect(run(`str='ニコニコ動画'; return str[4]`)).toBe("動");
  });

  test("indexOf", () => {
    expect(run(`return 'abcdef'.indexOf('d')`)).toBe(3);
    expect(
      run(`t1='abcdef';t2='d';check=(t1.indexOf(t2)>=0); return check`)
    ).toBe(true);
  });

  test("multiply", () => {
    expect(run(`return 'A'.multiply(2)`)).toBe("AA");
    expect(run(`return 'B'.multiply(10)`)).toBe("BBBBBBBBBB");
  });

  test("size", () => {
    expect(run(`return "ニコニコ動画".size`)).toBe(6);
  });

  test("slice", () => {
    expect(run(`return 'ABCDEF'.slice(2,2)`)).toBe("CD");
    expect(run(`return 'ABCDEF'.slice(-4)`)).toBe("CDEF");
  });

  test("toASNumber", () => {
    expect(run(`return '0777'.toASNumber`)).toBe(0);
    expect(run(`return '0.777'.toASNumber`)).toBe(0);
    expect(run(`return 'aiueo'.toASNumber`)).toBe(0);
  });

  test("toASString", () => {
    expect(run(`return '0777'.toASString`)).toBe("0777");
    expect(run(`return '0.777'.toASString`)).toBe("0.777");
    expect(run(`return 'aiueo'.toASString`)).toBe("aiueo");
  });

  test("toFloat", () => {
    expect(run(`return '2525.96'.toFloat`)).toBe(2525.96);
    expect(run(`return 'aiueo'.toFloat`)).toBe(NaN);
  });

  test("toInteger", () => {
    expect(run(`return '0777'.toInteger`)).toBe(511);
    expect(run(`return '0.777'.toInteger`)).toBe(0);
    expect(run(`return 'aiueo'.toInteger`)).toBe(NaN);
  });
});
