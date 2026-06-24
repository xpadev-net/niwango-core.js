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
    expect(run(`array=['A','B','C'];array.join()`)).toBe("A,B,C");
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
    expect(run(`array = ["A","B","C"];array.push("D")`)).toBe(4);
    expect(
      run(
        `i = 0;array = ["A"];result = array.push(i += 1,i += 1);result + ":" + array.join("-")`,
      ),
    ).toBe("3:A-1-2");
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
    expect(run(`array = ["A","B","C"];array.unshift("D")`)).toBe(4);
    expect(
      run(
        `i = 0;array = ["A"];result = array.unshift(i += 1,i += 1);result + ":" + array.join("-")`,
      ),
    ).toBe("3:1-2-A");
    expect(
      run(
        `array = ["A","B","C"];array.unshift("D");array.size + ":" + array[0]`,
      ),
    ).toBe("4:D");
  });

  test("walk", () => {
    expect(run(`i=0;test=[0,1,2,3];test.walk(\\(i+=@0));i`)).toBe(6);
  });
});
