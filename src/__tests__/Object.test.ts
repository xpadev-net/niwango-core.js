import { afterEach, describe, expect, test, vi } from "vitest";
import { run } from "@/testUtils";

const objectPrototype = Object.prototype as Record<string, unknown>;

afterEach(() => {
  delete objectPrototype.polluted;
  delete objectPrototype.pollutedCall;
});

const withMutedConsole = <T>(callback: () => T): T => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    return callback();
  } finally {
    consoleError.mockRestore();
    consoleLog.mockRestore();
  }
};

describe("Object.prototype", () => {
  test("def", () => {
    expect(run(`def(hoge(target),('こんにちは'+ target));hoge('世界')`)).toBe(
      "こんにちは世界",
    );
    expect(
      run(`obj = ['ほげ'];obj.def(hoge, ('配列の中身は' + self[0]));obj.hoge`),
    ).toBe("配列の中身はほげ");
    expect(
      run(
        `val = 'グローバル';def(hoge, val := 'ローカル';'val='+ val);hoge + 'val=' + val`,
      ),
    ).toBe("val=ローカルval=グローバル");
  });

  test("def_kari", () => {
    expect(run(`def_kari('test','テスト');test`)).toBe("テスト");
    expect(
      run(`def_kari('test',($2+txt+$1));test('123',txt:'テスト','456')`),
    ).toBe("456テスト123");
  });

  test("setSlot", () => {
    expect(run(`hoge={};hoge.setSlot("huga",256);hoge.huga`)).toBe(256);
    expect(run("hoge={};hoge.huga=256;hoge.huga")).toBe(256);
  });

  test("getSlot", () => {
    expect(run(`hoge={test:256};hoge.getSlot("test")`)).toBe(256);
    expect(run("hoge={test:256};hoge.test")).toBe(256);
  });

  test("forEachSlot iterates object slots with key and value", () => {
    expect(
      run(
        `result="";hoge={a:1,b:2};hoge.forEachSlot(\\(result+=@0+":"+@1+";"));result`,
      ),
    ).toBe("a:1;b:2;");
  });

  test("forEachSlot iterates array slots with numeric key and value", () => {
    expect(
      run(
        `result="";hoge=["A","B"];hoge.forEachSlot(\\(result+=@0+":"+@1+";"));result`,
      ),
    ).toBe("0:A;1:B;");
  });

  test("forEachSlot preserves named array slot keys", () => {
    expect(
      run(
        `result="";hoge=[];hoge.setSlot("name","N");hoge.forEachSlot(\\(result+=@0+":"+@1+";"));result`,
      ),
    ).toBe("name:N;");
  });

  test("forEachSlot leaves empty object untouched", () => {
    expect(run(`i=0;hoge={};hoge.forEachSlot(\\(i++));i`)).toBe(0);
  });

  test("clone", () => {
    expect(
      run("hoge={test:256};huga=hoge.clone;huga.test=1024;hoge.test"),
    ).toBe(256);
  });

  test("self", () => {
    expect(
      run("obj=Object.clone;obj.def(test(),self.hoge=1);obj.test();obj.hoge"),
    ).toBe(1);
    expect(
      run(
        "obj=Object.clone;obj.def(test(),self.hoge=1);obj2=Object.clone;obj2.def(test(),self.hoge=obj.clone;hoge.test());obj2.test();obj2.hoge.hoge",
      ),
    ).toBe(1);
  });

  test("dangerous member writes cannot pollute host prototypes", () => {
    withMutedConsole(() => {
      run("hoge={};hoge.__proto__.polluted=1");
      expect(objectPrototype.polluted).toBeUndefined();
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();

      run("hoge={};hoge.constructor.prototype.polluted=1");
      expect(objectPrototype.polluted).toBeUndefined();
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();

      run("hoge={};hoge.prototype=1");
      expect(run("hoge={};hoge.prototype")).toBeUndefined();
    });
  });

  test("object literal and slot APIs reject dangerous slot names", () => {
    expect(run("hoge={__proto__:{polluted:1}};hoge.__proto__")).toBeUndefined();
    expect(run("hoge={prototype:1};hoge.prototype")).toBeUndefined();
    expect(run('hoge={};hoge.setSlot("__proto__",256)')).toBeUndefined();
    expect(run('hoge={};hoge.setSlot("prototype",256)')).toBeUndefined();
    expect(run('hoge={};hoge.getSlot("__proto__")')).toBeUndefined();
    expect(run('hoge={};hoge.getSlot("prototype")')).toBeUndefined();

    run('hoge={};hoge.setSlot("constructor",{prototype:{polluted:1}})');
    expect(objectPrototype.polluted).toBeUndefined();
  });

  test("scope lookup cannot resolve dangerous inherited names", () => {
    withMutedConsole(() => {
      run("__proto__.polluted=1");
      expect(objectPrototype.polluted).toBeUndefined();
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  test("dangerous script-defined names are unreachable", () => {
    expect(
      run('hoge={};hoge.def_kari("__proto__","bad");hoge.__proto__'),
    ).toBeUndefined();
    expect(
      run('hoge={};hoge.def(__proto__(),"bad");hoge.__proto__'),
    ).toBeUndefined();
  });

  test("dangerous function parameters do not shift positional arguments", () => {
    expect(run("def(hoge(__proto__,safe),safe);hoge(1,2)")).toBe(2);
    expect(run("def(hoge(prototype,safe),safe);hoge(1,2)")).toBe(2);
  });

  test("call dispatch ignores inherited host and invalid computed slots", () => {
    withMutedConsole(() => {
      objectPrototype.pollutedCall = () => 1;
      expect(
        run("hoge={};hoge.pollutedCall()", { catch: true }),
      ).toBeUndefined();
    });

    expect(run('array=[];array[["constructor"]]')).toBeUndefined();
    expect(run('array=[];array[["__proto__"]]')).toBeUndefined();
    expect(
      run('array=[];array[["constructor"]]()', { catch: true }),
    ).toBeUndefined();
    expect(
      run('array=[];array[["__proto__"]]()', { catch: true }),
    ).toBeUndefined();
  });
});
