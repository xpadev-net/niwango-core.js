import { describe, expect, test } from "vitest";
import { run } from "@/testUtils";

describe("Number.prototype", () => {
  test("abs", () => {
    expect(run("(-10).abs")).toBe(10);
    expect(run("10.abs")).toBe(10);
  });

  test("cos", () => {
    expect(run("3.cos")).toBe(Math.cos(3));
    expect(run("10.cos")).toBe(Math.cos(10));
  });

  test("floor", () => {
    expect(run("3.14.floor")).toBe(3);
    expect(run("10.floor")).toBe(10);
  });

  test("pow", () => {
    expect(run("2.pow(10)")).toBe(1024);
    expect(run("3.pow(4)")).toBe(81);
  });

  test("sin", () => {
    expect(run("3.sin")).toBe(Math.sin(3));
    expect(run("10.sin")).toBe(Math.sin(10));
  });

  test("times", () => {
    expect(run("i=0;100.times(i++);i")).toBe(100);
    expect(run("j=100;i=0;j.times(i++);i")).toBe(100);
  });

  test("toASString", () => {
    expect(run("100.toASString")).toBe("100");
    expect(run("0.001.toASString")).toBe("0.001");
  });

  test("increase", () => {
    expect(run("100.increase")).toBe(101);
    expect(run("0.001.increase")).toBe(1.001);
  });

  test("decrease", () => {
    expect(run("100.decrease")).toBe(99);
    expect(run("0.decrease")).toBe(-1);
  });
});
