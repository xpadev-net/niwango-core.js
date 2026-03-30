import { expect, test } from "vitest";
import { run } from "@/testUtils";

test("while_kari", () => {
  expect(run("i=0;while_kari(i<10,i++);i")).toBe(10);
  expect(run("i=0;while_kari(i>-10,i--);i")).toBe(-10);
});

test("alternative", () => {
  expect(run(`(true).alt("hoge","huga")`)).toBe("hoge");
  expect(run(`(false).alt("hoge","huga")`)).toBe("huga");
  expect(run(`(true).alternative("hoge","huga")`)).toBe("hoge");
  expect(run(`(false).alternative("hoge","huga")`)).toBe("huga");
});

test("if", () => {
  expect(run("if(when:true,then:i=0,else:i=1);i")).toBe(0);
  expect(run("if(when:false,then:i=0,else:i=1);i")).toBe(1);
  expect(run("if(when:false,then:1,2)")).toBe(2);
  expect(run("if(when:0,then:1,2)")).toBe(1); // 0 is truthy in Niwango
  expect(run(`if(when:"",then:1,2)`)).toBe(1); // "" is truthy in Niwango
  expect(run("if(true,i=0,i=1);i")).toBe(0);
  expect(run("if(false,else:i=1);i")).toBe(1);
  expect(run("if(true,i=0);i")).toBe(0);
});
