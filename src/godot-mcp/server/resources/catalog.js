export const RESOURCE_DEFINITIONS = [
  {
    uri: "godot://project/info",
    name: "Godot Project Info",
    description: "Active Godot project metadata from the editor bridge.",
    mimeType: "application/json"
  },
  {
    uri: "godot://project/settings",
    name: "Godot Project Settings",
    description: "ProjectSettings values from the active Godot project.",
    mimeType: "application/json"
  },
  {
    uri: "godot://input/map",
    name: "Godot Input Map",
    description: "Input action bindings from the active Godot project.",
    mimeType: "application/json"
  },
  {
    uri: "godot://editor/state",
    name: "Godot Editor State",
    description: "Current scene, open scenes, selection, and bridge status.",
    mimeType: "application/json"
  },
  {
    uri: "godot://filesystem/tree",
    name: "Godot FileSystem Tree",
    description: "Recursive listing of project resources under res://.",
    mimeType: "application/json"
  },
  {
    uri: "godot://import/assets",
    name: "Godot Imported Assets",
    description: "Recursive listing of project assets that have .import metadata.",
    mimeType: "application/json"
  },
  {
    uri: "godot://import/events",
    name: "Godot Import Events",
    description: "Recent Import dock and EditorFileSystem import/reimport events.",
    mimeType: "application/json"
  },
  {
    uri: "godot://run/settings",
    name: "Godot Run Settings",
    description: "Configured Godot run settings such as the main scene.",
    mimeType: "application/json"
  },
  {
    uri: "godot://run/status",
    name: "Godot Run Status",
    description: "Current Godot editor play/run status.",
    mimeType: "application/json"
  },
  {
    uri: "godot://export/presets",
    name: "Godot Export Presets",
    description: "Configured export presets from the active Godot project.",
    mimeType: "application/json"
  },
  {
    uri: "godot://debugger/state",
    name: "Godot Debugger State",
    description: "Debugger sessions, breakpoints, recent debugger events, and performance monitors from the active Godot editor.",
    mimeType: "application/json"
  },
  {
    uri: "godot://runtime/state",
    name: "Godot Runtime State",
    description: "Runtime scene tree snapshots captured by the NIUA runtime probe.",
    mimeType: "application/json"
  },
  {
    uri: "godot://runtime/events",
    name: "Godot Runtime Events",
    description: "Recent runtime/debugger events captured by the NIUA Godot debugger probe.",
    mimeType: "application/json"
  },
  {
    uri: "godot://scene/tree",
    name: "Godot Scene Tree",
    description: "Serialized current edited scene tree.",
    mimeType: "application/json"
  },
  {
    uri: "godot://selection",
    name: "Godot Selection",
    description: "Current editor selection with per-node metadata.",
    mimeType: "application/json"
  },
  {
    uri: "godot://logs",
    name: "Godot Output Logs",
    description: "Recent editor bridge logs.",
    mimeType: "application/json"
  }
];
