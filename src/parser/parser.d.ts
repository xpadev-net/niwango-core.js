import { A_ANY } from "@/@types/ast";

type ParserLocation = {
  start: { offset: number; line: number; column: number };
  end: { offset: number; line: number; column: number };
  source: string;
};

/**
 * ニワン語をASTに変換するパーサー
 * @param script
 * @param options 設定
 * @returns
 */
export function parse(
  script: string,
  options?: Partial<{ grammarSource: string }>,
): A_ANY;

export const StartRules: ["Start"];

/**
 * パースエラーが発生した際に投げられるエラー?
 * 多分型はあってるはず
 */
declare class PeggySyntaxError extends Error {
  constructor(
    message: string,
    expected: unknown,
    found: string | null,
    location: ParserLocation,
  );
  expected: unknown;
  found: string | null;
  location: ParserLocation;
  name: "SyntaxError";
  format: (sources: { source: string; text: string }[]) => string;
  static buildMessage: (expected: unknown, found: string | null) => string;
}

export { PeggySyntaxError as SyntaxError };
