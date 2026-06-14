import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const BATCH_FILESYSTEM_OPERATIONS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    operations: {
      type: "array",
      description: "Ordered filesystem operations to execute under res://.",
      items: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["copy", "move", "delete"],
            description: "Filesystem operation to run."
          },
          fromPath: {
            type: "string",
            description: "Source path for copy or move operations."
          },
          toPath: {
            type: "string",
            description: "Destination path for copy or move operations."
          },
          path: {
            type: "string",
            description: "Target path for delete operations."
          },
          overwrite: {
            type: "boolean",
            description: "Allow copy operations to replace colliding files or merge into existing directories. Defaults to false."
          }
        },
        required: ["kind"],
        additionalProperties: false
      }
    },
    continueOnError: {
      type: "boolean",
      description: "Continue executing later operations after a failure. Defaults to false."
    },
    dryRun: {
      type: "boolean",
      description: "Validate and report planned operations without mutating files. Defaults to false."
    }
  },
  required: ["operations"],
  additionalProperties: false
};
