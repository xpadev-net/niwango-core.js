import { run } from "@/testUtils";

describe("Object.prototype", () => {
  test("def", () => {
    expect(
      run(`def(hoge(target),('こんにちは'+ target));return hoge('世界')`)
    ).toBe("こんにちは世界");
    expect(
      run(
        `obj = ['ほげ'];obj.def(hoge, ('配列の中身は' + self[0]));return obj.hoge`
      )
    ).toBe("配列の中身はほげ");
    expect(
      run(
        `val = 'グローバル';def(hoge, val := 'ローカル';'val='+ val);return(hoge + 'val=' + val)`
      )
    ).toBe("val=ローカルval=グローバル");
  });

  test("def_kari", () => {
    expect(run(`def_kari('test','テスト');return test`)).toBe("テスト");
    expect(
      run(`def_kari('test',($2+txt+$1));return test('123',txt:'テスト','456')`)
    ).toBe("456テスト123");
  });

  test("setSlot", () => {
    expect(run(`hoge={};hoge.setSlot("huga",256);return hoge.huga`)).toBe(256);
    expect(run("hoge={};hoge.huga=256;return hoge.huga")).toBe(256);
  });

  test("getSlot", () => {
    expect(run(`hoge={test:256};return hoge.getSlot("test")`)).toBe(256);
    expect(run("hoge={test:256};return hoge.test")).toBe(256);
  });

  test("clone", () => {
    expect(
      run("hoge={test:256};huga=hoge.clone;huga.test=1024;return hoge.test")
    ).toBe(256);
  });

  test("self", () => {
    expect(
      run(
        "obj=Object.clone;obj.def(test(),self.hoge=1);obj.test();return obj.hoge"
      )
    ).toBe(1);
    expect(
      run(
        "obj=Object.clone;obj.def(test(),self.hoge=1);obj2=Object.clone;obj2.def(test(),self.hoge=obj.clone;hoge.test());obj2.test();return obj2.hoge.hoge"
      )
    ).toBe(1);
  });
});
