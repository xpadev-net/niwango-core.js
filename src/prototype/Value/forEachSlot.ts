import { NotImplementedError } from "@/errors/NotImplementedError";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processForEachSlot: PrototypeValueFunction = (script, scopes) => {
  throw new NotImplementedError(script, scopes);
};

export { processForEachSlot };
