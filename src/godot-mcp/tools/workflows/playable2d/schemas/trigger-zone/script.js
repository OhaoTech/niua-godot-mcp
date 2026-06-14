export const TRIGGER_ZONE_SCRIPT_PROPERTIES = {
  attachScript: {
    type: "boolean",
    description: "Write and attach the generated trigger script. Defaults to true."
  },
  scriptPath: {
    type: "string",
    description: "GDScript path under res://. Defaults to res://scripts/<area>_trigger_2d.gd."
  },
  className: {
    type: "string",
    description: "Optional GDScript class_name. Defaults to <AreaName>Trigger2D."
  },
  eventName: {
    type: "string",
    description: "Event name emitted by the generated trigger script. Defaults to a slug of name."
  },
  watchBodies: {
    type: "boolean",
    description: "Connect body_entered/body_exited in the generated script. Defaults to true."
  },
  watchAreas: {
    type: "boolean",
    description: "Connect area_entered/area_exited in the generated script. Defaults to false."
  },
  printEvents: {
    type: "boolean",
    description: "Print trigger events when the Niua runtime probe is absent. Defaults to true."
  },
  overwriteScript: {
    type: "boolean",
    description: "Overwrite the generated trigger script. Defaults to false."
  },
  validateAfterCreate: {
    type: "boolean",
    description: "Validate the generated script before attaching it. Defaults to true."
  },
  saveScene: {
    type: "boolean",
    description: "Save the current scene after attaching the script. Defaults to true."
  }
};
