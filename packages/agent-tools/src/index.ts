import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

export const getObjectDef = toolDefinition({
  name: "get_object",
  description: "Get a 3D object from the scene by its ID and return its type and existence status",
  inputSchema: z.object({
    id: z.string().meta({ description: "The ID of the object to retrieve" }),
  }),
  outputSchema: z.object({
    id: z.string().meta({ description: "The ID of the requested object" }),
    type: z
      .string()
      .meta({ description: "The Three.js object type (e.g. Mesh, Group, Line) or 'not found'" }),
    exists: z.boolean().meta({ description: "Whether the object exists in the scene" }),
  }),
});

export const listObjectsDef = toolDefinition({
  name: "list_objects",
  description: "List all entity IDs currently in the scene",
  inputSchema: z.object({}),
  outputSchema: z.object({
    ids: z.array(z.string()).meta({ description: "Array of entity IDs in the scene" }),
  }),
});
