import { createBridgeClient } from "../context.js";

export async function readBridgeResource(uri, args = {}) {
  const client = createBridgeClient(args);

  switch (uri) {
    case "godot://project/info":
      return client.getProjectInfo();
    case "godot://project/settings":
      return client.getProjectSettings();
    case "godot://input/map":
      return client.getInputMap();
    case "godot://editor/state":
      return client.getEditorState();
    case "godot://filesystem/tree":
      return client.listFilesystem({ path: "res://", recursive: true });
    case "godot://import/assets":
      return client.listImportedAssets({ path: "res://", recursive: true });
    case "godot://import/events":
      return client.getImportEvents();
    case "godot://run/settings":
      return client.getRunSettings();
    case "godot://run/status":
      return client.getRunStatus();
    case "godot://export/presets":
      return client.listExportPresets();
    case "godot://debugger/state":
      return client.getDebuggerState();
    case "godot://runtime/state":
      return client.getRuntimeState();
    case "godot://runtime/events":
      return client.getRuntimeEvents();
    case "godot://scene/tree":
      return client.getSceneTree();
    case "godot://selection":
      return client.getSelection();
    case "godot://logs":
      return client.getLogs();
    default:
      throw Object.assign(new Error(`Unknown Godot resource: ${uri}`), { code: -32602 });
  }
}
