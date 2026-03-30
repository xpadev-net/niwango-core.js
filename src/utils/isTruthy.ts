/**
 * Niwangoのtruthyモデル: null, undefined, false のみ falsy
 * 0, "", NaN は truthy
 */
const isTruthy = (value: unknown): boolean => {
  return value !== null && value !== undefined && value !== false;
};

export { isTruthy };
