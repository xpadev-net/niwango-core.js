import { describe, expect, test } from "vitest";
import { run } from "@/testUtils";

/**
 * 配列の基本機能
 */
test("Array basic", () => {
  expect(
    run(
      `array = [["A","B"],["C",["D",["F"],"E"],"G"],"H","I"]; array[1][1][1][0]`,
    ),
  ).toBe("F");
  expect(
    run(
      `array = [["A","B"],["C",["D",["F"],"E"],"G"],"H","I"];array[1][1][1][0]="AAAA"; array[1][1][1][0]`,
    ),
  ).toBe("AAAA");
  expect(run(`array=[0,1,2,3];array[2]=5;array[2]`)).toBe(5);
});

describe("Array.prototype", () => {
  test("index", () => {
    expect(run(`["A","B","C"].index(2)`)).toBe("C");
    expect(run(`["A","B","C"][2]`)).toBe("C");
  });

  test("join", () => {
    expect(run(`array=['A','B','C'];array.join('-')`)).toBe("A-B-C");
    expect(run(`array=[1,2,3];array.join('')`)).toBe("123");
  });

  test("pop", () => {
    expect(run(`array = ["A","B","C"];array.pop`)).toBe("C");
    expect(
      run(
        `array = ["A","B","C"];array.pop;array.size + ":" + array[array.size-1]`,
      ),
    ).toBe("2:B");
  });

  test("product", () => {
    expect(run("array=[10,8,12];array.product")).toBe(960);
    expect(run("array=[0,1,2,3,4];array.product")).toBe(0);
  });

  test("push", () => {
    expect(run(`array = ["A","B","C"];array.push("D");array.size`)).toBe(4);
    expect(
      run(
        `array = ["A","B","C"];array.push("D");array.size + ":" + array[array.size-1]`,
      ),
    ).toBe("4:D");
  });

  test("shift", () => {
    expect(run(`array = ["A","B","C"];array.shift`)).toBe("A");
    expect(
      run(`array = ["A","B","C"];array.shift;array.size + ":" + array[0]`),
    ).toBe("2:B");
  });

  test("size", () => {
    expect(run(`["A","B","C"].size`)).toBe(3);
  });

  test("sort", () => {
    expect(run(`array = [2,1,3];array.sort;array.join(',')`)).toBe("1,2,3");
  });

  test("sum", () => {
    expect(run("array = [10,8,12];array.sum")).toBe(30);
  });

  test("unshift", () => {
    expect(run(`array = ["A","B","C"];array.unshift("D");array.size`)).toBe(4);
    expect(
      run(
        `array = ["A","B","C"];array.unshift("D");array.size + ":" + array[0]`,
      ),
    ).toBe("4:D");
    expect(run(`a=["A"];a.unshift("B").size`)).toBe(2);
  });

  test("walk", () => {
    expect(run(`i=0;[0,1,2,3].walk(\\(i+=@0));i`)).toBe(6);
    expect(run(`[1,2,3].walk(\\(@0)).size`)).toBe(3);
  });

  test("at", () => {
    expect(run(`[10,20,30].at(0)`)).toBe(10);
    expect(run(`[10,20,30].at(2)`)).toBe(30);
    expect(run(`[10,20,30].at(-1)`)).toBe(30);
    expect(run(`[10,20,30].at(-2)`)).toBe(20);
  });

  test("assign", () => {
    expect(run(`a=[1,2,3];a.assign(1,5);a[1]`)).toBe(5);
    expect(run(`a=[1,2,3];a.assign(1,5)`)).toBe(true);
    expect(run(`a=[1,2,3];a.assign(5,99);a[5]`)).toBe(99);
  });

  test("forEachEntry", () => {
    expect(run(`i=0;a=[1,2,3];a.forEachEntry(\\(i+=@0));i`)).toBe(6);
  });

  test("fold", () => {
    expect(run(`[1,2,3,4].fold(0,\\(@0+@1))`)).toBe(10);
    expect(run(`[1,2,3,4].fold(10,\\(@0+@1))`)).toBe(20);
    expect(run(`[1,2,3,4].fold(1,\\(@0*@1))`)).toBe(24);
  });

  test("find", () => {
    expect(run(`[10,20,30].find(20)`)).toBe(1);
    expect(run(`[10,20,30].find(99)`)).toBe(-1);
    expect(run(`[1,2,3,4,5].find(\\(@0>3))`)).toBe(3);
    expect(run(`[1,2,3].find(\\(@0>10))`)).toBe(-1);
  });

  test("add", () => {
    expect(run(`a=[1,2];b=[3,4];c=a.add(b);c.join(',')`)).toBe("1,2,3,4");
    expect(run(`[1,2].add([3,4]).size`)).toBe(4);
    expect(run(`a=[1,2];b=[3,4];a.add(b);a.size`)).toBe(2);
  });
});
