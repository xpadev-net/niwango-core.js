import { expect, test } from "vitest";
import { run } from "@/testUtils";

test("sample from wiki", () => {
  //source: https://web.archive.org/web/20161026165155id_/http://nicowiki.com/?%E3%83%8B%E3%83%AF%E3%83%B3%E8%AA%9E
  expect(run(`a = 2525; a += "動画";a`)).toBe("2525動画");
  expect(run(`a = 2525; a += ""; a += 1;a`)).toBe("25251");
  expect(run(`a = "2525"; a += 1; a`)).toBe("25251");
  expect(run(`a = "2525"; a -= 0; a += 1;a`)).toBe(2526);
  expect(run("a = 02525; a")).toBe(1365);
  expect(run("a = 0x2525; a")).toBe(9509);
});

test("variable declaration", () => {
  expect(run("i=0;i")).toBe(0);
});
test("calculation declaration", () => {
  expect(run("1+1")).toBe(2);
  expect(run("1-1")).toBe(0);
  expect(run("2*2")).toBe(4);
  expect(run("8/2")).toBe(4);
  expect(run("2-4")).toBe(-2);
  expect(run("2*-4")).toBe(-8);
  expect(run("10/-4")).toBe(-2.5);
});
test("times", () => {
  expect(run("i=0;10.times(i++);i")).toBe(10);
  expect(run("i=0;1000.times(i++);i")).toBe(1000);
});
test("lambda", () => {
  expect(run("i=0;lmd=\\(i+=@0);lmd[10]")).toBe(10);
  expect(run("i=0;lmd=\\(i+=@0*@1);lmd[10,2]")).toBe(20);
  expect(run("i=10;lmd=\\(i+=@0*@1);lmd[10,2]")).toBe(30);
  expect(run(`lmd=\\(@0+@1);lmd["hello","world"]`)).toBe("helloworld");
});
test("sequence", () => {
  expect(run("0,12,5")).toBe(5);
  expect(run(`"hoge","fuga","piyo"`)).toBe("piyo");
});
