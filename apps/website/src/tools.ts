import { clientTools } from "@tanstack/ai-client";
import { api as store } from "./store.ts";
import { getObjectDef, listObjectsDef } from "agent-tools";

const getObject = getObjectDef.client((input) => {
  const obj = store.get(input.id);
  return {
    id: input.id,
    type: obj ? obj.type : "not found",
    exists: !!obj,
  };
});

const listObjects = listObjectsDef.client(() => {
  return { ids: store.list() };
});

export const tools = clientTools(getObject, listObjects);
