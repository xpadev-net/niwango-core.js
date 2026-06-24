type SlotKey = string | number;
type SlotStore = {
  [key: string | number]: unknown;
};

const dangerousSlotNames = new Set(["__proto__", "constructor", "prototype"]);

const createSlotStore = (): SlotStore => {
  return Object.create(null) as SlotStore;
};

const isSlotStore = (value: unknown): value is SlotStore => {
  return (
    (typeof value === "object" && value !== null) || typeof value === "function"
  );
};

const getReadableSlotStore = (value: unknown): SlotStore | undefined => {
  if (isSlotStore(value)) {
    return value;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return Object(value) as SlotStore;
  }
  return undefined;
};

const normalizeSlotKey = (key: unknown): SlotKey | undefined => {
  if (typeof key !== "string" && typeof key !== "number") {
    return undefined;
  }
  if (typeof key === "string" && dangerousSlotNames.has(key)) {
    return undefined;
  }
  return key;
};

const getOwnSlot = (target: unknown, key: SlotKey | undefined): unknown => {
  const slotStore = getReadableSlotStore(target);
  if (key === undefined || !slotStore) {
    return undefined;
  }
  if (!Object.hasOwn(slotStore, key)) {
    return undefined;
  }
  return slotStore[key];
};

const hasOwnSlot = (target: unknown, key: SlotKey | undefined): boolean => {
  const slotStore = getReadableSlotStore(target);
  if (key === undefined || !slotStore) {
    return false;
  }
  return Object.hasOwn(slotStore, key);
};

const setOwnSlot = (
  target: unknown,
  key: SlotKey | undefined,
  value: unknown,
): boolean => {
  if (key === undefined || !isSlotStore(target)) {
    return false;
  }
  if (typeof key === "string" && dangerousSlotNames.has(key)) {
    return false;
  }
  target[key] = value;
  return true;
};

export {
  createSlotStore,
  getOwnSlot,
  hasOwnSlot,
  normalizeSlotKey,
  setOwnSlot,
};
export type { SlotKey, SlotStore };
