import { format } from "@/utils/format";
import { isTruthy } from "@/utils/isTruthy";
import { sprintf } from "@/utils/sprintf";

/**
 * 掛け算処理
 * 文字列に数値を掛けた場合は、文字列を繰り返す
 * @param left
 * @param right
 */
const Multiplication = (left: unknown, right: unknown) => {
  if (typeof left === "string") {
    const n = format(right, "number");
    if (!n || n < 0 || !Number.isFinite(n)) return "";
    return left.repeat(Math.floor(n));
  }
  return format(left, "number") * format(right, "number");
};

/**
 * 引き算処理
 * @param left
 * @param right
 */
const Subtraction = (left: unknown, right: unknown) => {
  return format(left, "number") - format(right, "number");
};

/**
 * 足し算処理
 * @param left
 * @param right
 */
const Addition = (left: unknown, right: unknown) => {
  if (typeof left === "string" || typeof right === "string") {
    return `${format(left, "string")}${format(right, "string")}`;
  }
  return format(left, "number") + format(right, "number");
};

/**
 * 比較処理 <
 * @param left
 * @param right
 * @constructor
 */
const LessThan = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    return left < right;
  }
  const l = typeof left === "string" ? Number(left) : format(left, "number");
  const r = typeof right === "string" ? Number(right) : format(right, "number");
  return l < r;
};

/**
 * 比較処理 >
 * @param left
 * @param right
 * @constructor
 */
const GreaterThan = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    return left > right;
  }
  const l = typeof left === "string" ? Number(left) : format(left, "number");
  const r = typeof right === "string" ? Number(right) : format(right, "number");
  return l > r;
};

/**
 * 比較処理 <=
 * @param left
 * @param right
 * @constructor
 */
const LessThanOrEqual = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    return left <= right;
  }
  const l = typeof left === "string" ? Number(left) : format(left, "number");
  const r = typeof right === "string" ? Number(right) : format(right, "number");
  return l <= r;
};

/**
 * 比較処理 >=
 * @param left
 * @param right
 * @constructor
 */
const GreaterThanOrEqual = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    return left >= right;
  }
  const l = typeof left === "string" ? Number(left) : format(left, "number");
  const r = typeof right === "string" ? Number(right) : format(right, "number");
  return l >= r;
};

/**
 * 割り算処理
 * @param left
 * @param right
 * @constructor
 */
const Division = (left: unknown, right: unknown) => {
  return format(left, "number") / format(right, "number");
};

/**
 * あまり計算
 * @param left
 * @param right
 * @constructor
 */
const Remainder = (left: unknown, right: unknown) => {
  if (typeof left === "string" && Array.isArray(right)) {
    return sprintf(left, right);
  }
  return format(left, "number") % format(right, "number");
};

/**
 * べき乗処理
 * @param left
 * @param right
 * @constructor
 */
const Exponentiation = (left: unknown, right: unknown) => {
  return format(left, "number") ** format(right, "number");
};

/**
 * ビット演算 AND
 * @param left
 * @param right
 * @constructor
 */
const BitwiseAND = (left: unknown, right: unknown) => {
  return format(left, "number") & format(right, "number");
};

/**
 * ビット演算 OR
 * @param left
 * @param right
 * @constructor
 */
const BitwiseOR = (left: unknown, right: unknown) => {
  return format(left, "number") | format(right, "number");
};

/**
 * ビット演算 XOR
 * @param left
 * @param right
 * @constructor
 */
const BitwiseXOR = (left: unknown, right: unknown) => {
  return format(left, "number") ^ format(right, "number");
};

/**
 * ビット演算 NOT
 * @param value
 * @constructor
 */
const BitwiseNOT = (value: unknown) => {
  return ~format(value, "number");
};

/**
 * 左シフト
 * @param left
 * @param right
 * @constructor
 */
const LeftShift = (left: unknown, right: unknown) => {
  return format(left, "number") << format(right, "number");
};

/**
 * 右シフト
 * @param left
 * @param right
 * @constructor
 */
const RightShift = (left: unknown, right: unknown) => {
  return format(left, "number") >> format(right, "number");
};

/**
 * 符号なし右シフト
 * @param left
 * @param right
 * @constructor
 */
const UnsignedRightShift = (left: unknown, right: unknown) => {
  return format(left, "number") >>> format(right, "number");
};

/**
 * 単項演算子 -
 * @param value
 * @constructor
 */
const UnaryNegation = (value: unknown) => {
  return -format(value, "number");
};

/**
 * 単項演算子 +
 * @param value
 * @constructor
 */
const UnaryPlus = (value: unknown) => {
  return format(value, "number");
};

/**
 * 理論否定
 * @param value
 * @constructor
 */
const LogicalNot = (value: unknown) => {
  return !isTruthy(value);
};

/**
 * 比較
 * @param left
 * @param right
 */
const Compare = (left: unknown, right: unknown) => {
  if (typeof left === "string" && typeof right === "string") {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }
  const leftNumber = format(left, "number");
  const rightNumber = format(right, "number");
  if (leftNumber < rightNumber) return -1;
  if (leftNumber > rightNumber) return 1;
  return 0;
};

const Equality = (left: unknown, right: unknown) => {
  return left === right;
};

const LooseEquality = (left: unknown, right: unknown): boolean => {
  if (left == null || right == null) return left == null && right == null;
  let l: unknown = left;
  let r: unknown = right;
  if (typeof l === "boolean") l = l ? 1 : 0;
  if (typeof r === "boolean") r = r ? 1 : 0;
  if (typeof l === typeof r) return l === r;
  if (typeof l === "number" || typeof r === "number")
    return format(l, "number") === format(r, "number");
  if (typeof l === "string" || typeof r === "string")
    return format(l, "string") === format(r, "string");
  return l === r;
};

export {
  Addition,
  BitwiseAND,
  BitwiseNOT,
  BitwiseOR,
  BitwiseXOR,
  Compare,
  Division,
  Equality,
  Exponentiation,
  GreaterThan,
  GreaterThanOrEqual,
  LeftShift,
  LessThan,
  LessThanOrEqual,
  LogicalNot,
  LooseEquality,
  Multiplication,
  Remainder,
  RightShift,
  Subtraction,
  UnaryNegation,
  UnaryPlus,
  UnsignedRightShift,
};
