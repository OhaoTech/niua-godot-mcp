import { CONNECTION_PROPERTIES } from "../../../../shared/bridge-schema.js";
import { TRIGGER_ZONE_AREA_PROPERTIES } from "./area.js";
import { TRIGGER_ZONE_COLLISION_PROPERTIES } from "./collision.js";
import { TRIGGER_ZONE_VISUAL_PROPERTIES } from "./visual.js";
import { TRIGGER_ZONE_SCRIPT_PROPERTIES } from "./script.js";

export const CREATE_2D_TRIGGER_ZONE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...TRIGGER_ZONE_AREA_PROPERTIES,
    ...TRIGGER_ZONE_COLLISION_PROPERTIES,
    ...TRIGGER_ZONE_VISUAL_PROPERTIES,
    ...TRIGGER_ZONE_SCRIPT_PROPERTIES
  },
  additionalProperties: false
};
