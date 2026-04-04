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
    expect(run(`[2,1,3].sort.join(',')`)).toBe("1,2,3");
    expect(run(`a=[2,1,3];a.sort;a.join(',')`)).toBe("2,1,3");
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
    expect(run(`[10,20,30].at(1.9)`)).toBe(20);
    expect(run(`[10,20,30].at(5)`)).toBe(undefined);
    expect(run(`[10,20,30].at(-4)`)).toBe(undefined);
  });

  test("assign", () => {
    expect(run(`a=[1,2,3];a.assign(1,5);a[1]`)).toBe(5);
    expect(run(`a=[1,2,3];a.assign(1,5)`)).toBe(true);
    expect(run(`a=[1,2,3];a.assign(5,99);a[5]`)).toBe(99);
    expect(run(`a=[1,2,3];a.assign(1.9,5);a[1]`)).toBe(5);
    expect(run(`a=[1,2,3];a.assign(0/0,5)`)).toBe(false);
    expect(run(`a=[1,2,3];a.assign(1/0,5)`)).toBe(false);
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

/**
 * SWF (IrArray) 互換性テスト
 * latest_nicoscript.as lines 7046-7557 の動作を保証する
 */
describe("SWF compatibility", () => {
  // SWF: push/unshift return this (chainable)
  test("push returns the array (this)", () => {
    expect(run(`[1,2].push(3).size`)).toBe(3);
    expect(run(`[1].push(2).push(3).size`)).toBe(3);
  });

  test("unshift returns the array (this)", () => {
    expect(run(`[1,2].unshift(0).size`)).toBe(3);
    expect(run(`[3].unshift(2).unshift(1).size`)).toBe(3);
  });

  // SWF: pop/shift return null for empty arrays
  test("pop returns null on empty array", () => {
    expect(run(`[].pop`)).toBe(null);
  });

  test("shift returns null on empty array", () => {
    expect(run(`[].shift`)).toBe(null);
  });

  // SWF: sort returns new array, does not mutate original
  test("sort is non-destructive", () => {
    expect(run(`a=[3,1,2];b=a.sort;a[0]`)).toBe(3);
    expect(run(`a=[3,1,2];b=a.sort;b[0]`)).toBe(1);
    expect(run(`a=[3,1,2];a.sort;a[0]`)).toBe(3);
  });

  // SWF: walk returns this (chainable), forEachEntry returns void
  test("walk returns the array (this)", () => {
    expect(run(`[1,2,3].walk(\\(@0)).size`)).toBe(3);
    expect(run(`i=0;a=[1,2,3];a.walk(\\(i+=@0));a.size`)).toBe(3);
  });

  // SWF: at supports negative index, -1 = last
  test("at with negative index", () => {
    expect(run(`["A","B","C"].at(-1)`)).toBe("C");
    expect(run(`["A","B","C"].at(-3)`)).toBe("A");
  });

  // SWF: assign returns boolean, mutates array
  test("assign mutates and returns success", () => {
    expect(run(`a=[1,2,3];a.assign(0,10);a[0]`)).toBe(10);
    expect(run(`a=[1,2,3];a.assign(-1,99);a[2]`)).toBe(99);
  });

  // SWF: find returns index, -1 if not found
  test("find returns correct index", () => {
    expect(run(`[10,20,30,20].find(20)`)).toBe(1);
    expect(run(`[10,20,30].find(40)`)).toBe(-1);
  });

  test("find with lambda predicate", () => {
    expect(run(`[1,2,3,4,5].find(\\(@0>=4))`)).toBe(3);
    expect(run(`[1,2,3].find(\\(@0>100))`)).toBe(-1);
  });

  // SWF: find lambda uses toASBoolean (Niwango truthiness: 0 is truthy)
  test("find lambda treats 0 as truthy (Niwango semantics)", () => {
    expect(run(`[1,2,3].find(\\(0))`)).toBe(0);
  });

  // SWF: add returns new array, originals unchanged
  test("add does not mutate originals", () => {
    expect(run(`a=[1];b=[2];c=a.add(b);a.size`)).toBe(1);
    expect(run(`a=[1];b=[2];c=a.add(b);b.size`)).toBe(1);
    expect(run(`a=[1];b=[2];c=a.add(b);c.size`)).toBe(2);
  });

  test("add with non-array returns null", () => {
    expect(run(`[1,2].add(3)`)).toBe(null);
    expect(run(`[1,2].add("x")`)).toBe(null);
  });

  // SWF: fold accumulates with @0=acc, @1=elem
  test("fold with string accumulator", () => {
    expect(run(`["A","B","C"].fold("",\\(@0+@1))`)).toBe("ABC");
  });

  test("fold on empty array returns initial value", () => {
    expect(run(`[].fold(42,\\(@0+@1))`)).toBe(42);
  });

  // SWF: toASString format <[elem,elem,...]>
  test("toASString format", () => {
    expect(run(`[1,2,3].toASString`)).toBe("<[1,2,3]>");
    expect(run(`["A","B"].toASString`)).toBe("<[A,B]>");
    expect(run(`[].toASString`)).toBe("<[]>");
  });

  // SWF: size returns element count
  test("size after mutations", () => {
    expect(run(`a=[1,2,3];a.pop;a.size`)).toBe(2);
    expect(run(`a=[1,2,3];a.shift;a.size`)).toBe(2);
    expect(run(`a=[1,2,3];a.push(4);a.size`)).toBe(4);
    expect(run(`a=[];a.size`)).toBe(0);
  });

  // SWF: combined operations
  test("chained push and walk", () => {
    expect(run(`i=0;[1,2].push(3).walk(\\(i+=@0));i`)).toBe(6);
  });

  test("sort then join", () => {
    expect(run(`[3,1,2].sort.join("-")`)).toBe("1-2-3");
  });

  test("add then sort", () => {
    expect(run(`[3,1].add([4,2]).sort.join(",")`)).toBe("1,2,3,4");
  });
});
