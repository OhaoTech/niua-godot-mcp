import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import {
  bridgeMethodsFromManifest,
  godotRoutesFromManifest,
  toolDefinitionsFromManifest,
  validateToolManifest
} from "../../../src/godot-mcp/manifest/index.js";
import {
  MIGRATED_MANIFEST_DOMAINS,
  MIGRATED_TOOL_MANIFESTS
} from "../../../src/godot-mcp/manifest/domains.js";
import { ANIMATION_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/animation/manifest.js";
import { DEBUGGER_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/debugger/manifest.js";
import { EXPORT_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/export/manifest.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/filesystem/manifest.js";
import { INSPECTOR_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/inspector/manifest.js";
import { LOCALIZATION_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/localization/manifest.js";
import { COMMON_NODE_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/nodes/common/manifest.js";
import { NODE2D_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/nodes/node2d/manifest.js";
import { NODE3D_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/nodes/node3d/manifest.js";
import { PROJECT_MANAGEMENT_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/project/manifest.js";
import { RUN_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/run/manifest.js";
import { RESOURCE_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/resources/manifest.js";
import { RUNTIME_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/runtime/manifest.js";
import { SCENE_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/scene/manifest.js";
import { SCRIPT_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/scripts/manifest.js";
import { VIEWPORT_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/viewport/manifest.js";
import { PLAYABLE2D_WORKFLOW_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/workflows/playable2d/manifest.js";
import { PLAYABLE3D_WORKFLOW_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/workflows/playable3d/manifest.js";
import { readAddonFileExact } from "../helpers/plugin-files.js";

async function withJsonBridge(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("validateToolManifest requires end-to-end bridge contract fields", () => {
  assert.throws(
    () => validateToolManifest([
      {
        name: "bad_tool",
        description: "Missing bridge and Godot route metadata.",
        profile: "full",
        tier: "standard",
        category: "bad",
        inputSchema: { type: "object", properties: {}, additionalProperties: false }
      }
    ]),
    /bad_tool.*bridge/
  );
});

test("validateToolManifest requires a capability-graph tier on every entry", () => {
  for (const tier of [undefined, "core", "rare", ""]) {
    assert.throws(
      () => validateToolManifest([
        {
          name: "tierless_tool",
          description: "Missing or invalid tier metadata.",
          profile: "full",
          ...(tier === undefined ? {} : { tier }),
          category: "bad",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          implementation: "local",
          local: { handler: "noop" },
          conformance: { happy: "x", error: "y" },
          docs: { summary: "x" }
        }
      ]),
      /tierless_tool manifest tier must be essential or standard/,
      `tier ${JSON.stringify(tier)} should be rejected`
    );
  }
});

test("localization manifest defines the complete localization tool contract", () => {
  validateToolManifest(LOCALIZATION_TOOL_MANIFEST);

  assert.deepEqual(LOCALIZATION_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_csv_translation",
    "register_translation_file",
    "set_locale",
    "get_localization_state"
  ]);
  assert.deepEqual(LOCALIZATION_TOOL_MANIFEST.map((entry) => entry.profile), [
    "full",
    "full",
    "full",
    "full"
  ]);
  assert.ok(LOCALIZATION_TOOL_MANIFEST.every((entry) => entry.category === "localization"));
  assert.ok(LOCALIZATION_TOOL_MANIFEST.every((entry) => entry.conformance?.happy));
  assert.ok(LOCALIZATION_TOOL_MANIFEST.every((entry) => entry.conformance?.error));
});

test("migrated manifest registry validates every migrated domain", () => {
  assert.deepEqual(MIGRATED_MANIFEST_DOMAINS.map((domain) => domain.name), [
    "animation",
    "audio",
    "debugger-control",
    "debugger-runtime",
    "describe",
    "export",
    "filesystem",
    "import",
    "inspector",
    "localization",
    "multiplayer",
    "navigation",
    "nodes-common",
    "nodes-2d",
    "nodes-3d",
    "particles",
    "playable2d-workflows",
    "playable3d-workflows",
    "project-management",
    "project-settings",
    "run",
    "resources",
    "runtime",
    "scene",
    "scripts",
    "ui",
    "viewport"
  ]);
  validateToolManifest(MIGRATED_TOOL_MANIFESTS);
  assert.equal(MIGRATED_TOOL_MANIFESTS.length, 176);
});

test("animation manifest defines imported-scene and editor animation contracts", () => {
  validateToolManifest(ANIMATION_TOOL_MANIFEST);

  assert.deepEqual(ANIMATION_TOOL_MANIFEST.map((entry) => entry.name), [
    "upsert_animation",
    "list_animations",
    "play_animation",
    "stop_animation",
    "get_animation_state",
    "instance_animated_scene",
    "create_animation_tree_state_machine",
    "travel_animation_tree"
  ]);
  assert.deepEqual(
    ANIMATION_TOOL_MANIFEST
      .filter((entry) => entry.godotRoute.side === "read")
      .map((entry) => entry.name),
    ["list_animations", "get_animation_state"]
  );
  assert.ok(ANIMATION_TOOL_MANIFEST.every((entry) => entry.category === "animation"));
});

test("filesystem manifest defines the complete filesystem bridge contract", () => {
  validateToolManifest(FILESYSTEM_TOOL_MANIFEST);

  assert.deepEqual(FILESYSTEM_TOOL_MANIFEST.map((entry) => entry.name), [
    "get_filesystem_dock_state",
    "list_filesystem",
    "create_folder",
    "read_text_file",
    "write_text_file",
    "write_binary_file",
    "move_filesystem_entry",
    "copy_filesystem_entry",
    "batch_filesystem_operations",
    "delete_filesystem_entry"
  ]);
  assert.ok(FILESYSTEM_TOOL_MANIFEST.every((entry) => entry.category === "filesystem"));
});

test("export manifest includes bridge preset tools and local CLI helpers", () => {
  validateToolManifest(EXPORT_TOOL_MANIFEST);

  assert.deepEqual(EXPORT_TOOL_MANIFEST.map((entry) => entry.name), [
    "list_export_presets",
    "upsert_export_preset",
    "diagnose_export_templates",
    "validate_export_preset",
    "export_project"
  ]);
  assert.deepEqual(
    EXPORT_TOOL_MANIFEST
      .filter((entry) => entry.implementation === "local")
      .map((entry) => [entry.name, entry.local.handler]),
    [
      ["diagnose_export_templates", "diagnoseExportTemplates"],
      ["validate_export_preset", "validateExportPreset"],
      ["export_project", "exportGodotProject"]
    ]
  );
  assert.ok(EXPORT_TOOL_MANIFEST.every((entry) => entry.category === "export"));
});

test("debugger manifest includes control and runtime probe bridge tools", () => {
  validateToolManifest(DEBUGGER_TOOL_MANIFEST);

  assert.deepEqual(DEBUGGER_TOOL_MANIFEST.map((entry) => entry.name), [
    "get_debugger_state",
    "set_debugger_breakpoint",
    "toggle_debugger_profiler",
    "send_debugger_message",
    "install_runtime_probe",
    "get_runtime_state",
    "get_runtime_events",
    "get_runtime_node_properties",
    "set_runtime_node_property",
    "capture_runtime_screenshot",
    "send_runtime_input",
    "call_runtime_node_method"
  ]);
  assert.deepEqual(
    DEBUGGER_TOOL_MANIFEST
      .filter((entry) => entry.bridge.generate === false)
      .map((entry) => entry.name),
    [
      "install_runtime_probe",
      "get_runtime_state",
      "get_runtime_events",
      "get_runtime_node_properties",
      "set_runtime_node_property",
      "capture_runtime_screenshot",
      "send_runtime_input",
      "call_runtime_node_method"
    ]
  );
  assert.ok(DEBUGGER_TOOL_MANIFEST.every((entry) => entry.category === "debugger"));
});

test("inspector manifest preserves write-table query route metadata", () => {
  validateToolManifest(INSPECTOR_TOOL_MANIFEST);

  assert.deepEqual(INSPECTOR_TOOL_MANIFEST.map((entry) => entry.name), [
    "get_inspector_properties",
    "set_node_property"
  ]);
  assert.deepEqual(
    INSPECTOR_TOOL_MANIFEST.map((entry) => entry.godotRoute),
    [
      {
        side: "write",
        endpoint: "/inspector/properties",
        handler: "_inspector_properties",
        arg: "query",
        method: ""
      },
      {
        side: "write",
        endpoint: "/inspector/property/set",
        handler: "_set_node_property",
        arg: "body",
        methodError: "property set requires POST"
      }
    ]
  );
  assert.ok(INSPECTOR_TOOL_MANIFEST.every((entry) => entry.category === "inspector"));
});

test("runtime manifest captures local runtime server tools", () => {
  validateToolManifest(RUNTIME_TOOL_MANIFEST);

  assert.deepEqual(RUNTIME_TOOL_MANIFEST.map((entry) => entry.name), [
    "get_godot_version"
  ]);
  assert.deepEqual(RUNTIME_TOOL_MANIFEST.map((entry) => entry.implementation), [
    "local"
  ]);
  assert.ok(RUNTIME_TOOL_MANIFEST.every((entry) => entry.category === "runtime"));
});

test("project management manifest captures local project lifecycle discovery and log tools", () => {
  validateToolManifest(PROJECT_MANAGEMENT_TOOL_MANIFEST);

  assert.deepEqual(PROJECT_MANAGEMENT_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_project",
    "open_project",
    "get_open_projects",
    "close_project",
    "import_project",
    "install_project_addon",
    "list_known_projects",
    "forget_project",
    "diagnose_project_setup",
    "discover_projects",
    "discover_editor_bridges",
    "list_scenes",
    "get_output_logs"
  ]);
  assert.ok(PROJECT_MANAGEMENT_TOOL_MANIFEST.every((entry) => entry.implementation === "local"));
  assert.deepEqual(
    PROJECT_MANAGEMENT_TOOL_MANIFEST
      .filter((entry) => entry.profile === "v1")
      .map((entry) => entry.name),
    [
      "create_project",
      "open_project",
      "close_project",
      "diagnose_project_setup",
      "get_output_logs"
    ]
  );
  assert.ok(PROJECT_MANAGEMENT_TOOL_MANIFEST.every((entry) => entry.category === "project-management"));
});

test("playable workflow manifests capture local 2D and 3D workflow tools", () => {
  validateToolManifest(PLAYABLE2D_WORKFLOW_TOOL_MANIFEST);
  validateToolManifest(PLAYABLE3D_WORKFLOW_TOOL_MANIFEST);

  assert.deepEqual(PLAYABLE2D_WORKFLOW_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_2d_playable_blockout",
    "create_2d_character_controller",
    "create_2d_trigger_zone"
  ]);
  assert.deepEqual(PLAYABLE3D_WORKFLOW_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_3d_playable_blockout",
    "create_3d_character_controller"
  ]);
  assert.ok(PLAYABLE2D_WORKFLOW_TOOL_MANIFEST.every((entry) => entry.implementation === "local"));
  assert.ok(PLAYABLE3D_WORKFLOW_TOOL_MANIFEST.every((entry) => entry.implementation === "local"));
});

test("common node manifest preserves shared scene node bridge contracts", () => {
  validateToolManifest(COMMON_NODE_TOOL_MANIFEST);

  assert.deepEqual(COMMON_NODE_TOOL_MANIFEST.map((entry) => entry.name), [
    "search_node_types",
    "create_node",
    "create_node_with_script",
    "rename_node",
    "delete_node",
    "duplicate_node",
    "reparent_node",
    "reorder_node"
  ]);
  assert.ok(COMMON_NODE_TOOL_MANIFEST.every((entry) => entry.category === "nodes-common"));
  assert.deepEqual(
    Object.keys(bridgeMethodsFromManifest(COMMON_NODE_TOOL_MANIFEST)),
    [
      "searchNodeTypes",
      "createNode",
      "createNodeWithScript",
      "renameNode",
      "deleteNode",
      "duplicateNode",
      "reparentNode",
      "reorderNode"
    ]
  );
  assert.deepEqual(
    godotRoutesFromManifest(COMMON_NODE_TOOL_MANIFEST).write.map((route) => route.endpoint),
    [
      "/scene/node/create",
      "/scene/node/create-with-script",
      "/scene/node/rename",
      "/scene/node/delete",
      "/scene/node/duplicate",
      "/scene/node/reparent",
      "/scene/node/reorder"
    ]
  );
});

test("Node2D manifest captures curated local 2D node tools", () => {
  validateToolManifest(NODE2D_TOOL_MANIFEST);

  assert.deepEqual(NODE2D_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_sprite_2d",
    "create_animated_sprite_2d",
    "create_tile_map_layer",
    "set_tile_map_layer_cells",
    "paint_tile_map_layer_terrain",
    "create_camera_2d",
    "create_collision_shape_2d",
    "create_static_body_2d",
    "create_character_body_2d",
    "create_area_2d"
  ]);
  assert.ok(NODE2D_TOOL_MANIFEST.every((entry) => entry.profile === "full"));
  assert.ok(NODE2D_TOOL_MANIFEST.every((entry) => entry.category === "nodes-2d"));
  assert.ok(NODE2D_TOOL_MANIFEST.every((entry) => entry.implementation === "local"));
});

test("Node3D manifest captures curated local 3D node tools and v1 profile membership", () => {
  validateToolManifest(NODE3D_TOOL_MANIFEST);

  assert.deepEqual(NODE3D_TOOL_MANIFEST.map((entry) => entry.name), [
    "create_light_3d",
    "create_camera_3d",
    "create_collision_shape_3d",
    "create_mesh_instance_3d",
    "create_rigid_body_3d",
    "create_character_body_3d",
    "create_static_body_3d",
    "create_area_3d"
  ]);
  // L1 3D creators are standard/full; core uses create_node + create_resource + recipes.
  assert.deepEqual(
    NODE3D_TOOL_MANIFEST
      .filter((entry) => entry.profile === "v1")
      .map((entry) => entry.name),
    []
  );
  assert.ok(NODE3D_TOOL_MANIFEST.every((entry) => entry.tier === "standard"));
  assert.ok(NODE3D_TOOL_MANIFEST.every((entry) => entry.category === "nodes-3d"));
  assert.ok(NODE3D_TOOL_MANIFEST.every((entry) => entry.implementation === "local"));
});

test("resource manifest preserves resource builder and assignment contracts", () => {
  validateToolManifest(RESOURCE_TOOL_MANIFEST);

  assert.deepEqual(RESOURCE_TOOL_MANIFEST.map((entry) => entry.name), [
    "open_resource",
    "focus_resource",
    "create_resource",
    "save_resource",
    "create_sprite_frames",
    "create_tile_set",
    "create_material",
    "create_shader_material",
    "assign_material"
  ]);
  assert.deepEqual(
    RESOURCE_TOOL_MANIFEST
      .filter((entry) => entry.adapter)
      .map((entry) => [entry.name, entry.adapter.handler]),
    [
      ["create_sprite_frames", "createSpriteFrames"],
      ["create_tile_set", "createTileSet"],
      ["create_material", "createMaterial"],
      ["create_shader_material", "createShaderMaterial"]
    ]
  );
  assert.deepEqual(
    RESOURCE_TOOL_MANIFEST
      .filter((entry) => entry.bridge.owner === "nodes")
      .map((entry) => entry.name),
    ["assign_material"]
  );
  assert.deepEqual(
    RESOURCE_TOOL_MANIFEST
      .filter((entry) => entry.bridge.generate === false)
      .map((entry) => [entry.name, entry.bridge.clientMethod]),
    [["create_material", "createResource"]]
  );
  assert.ok(RESOURCE_TOOL_MANIFEST.every((entry) => entry.category === "resources"));
});

test("scene manifest preserves the grouped scene tool contract", () => {
  validateToolManifest(SCENE_TOOL_MANIFEST);

  assert.deepEqual(SCENE_TOOL_MANIFEST.map((entry) => entry.name), [
    "get_editor_state",
    "get_project_info",
    "get_scene_tree",
    "get_open_scene_tabs",
    "get_selection",
    "set_selection",
    "focus_node",
    "open_scene",
    "create_scene",
    "save_scene_as",
    "switch_scene_tab",
    "close_scene",
    "mark_scene_unsaved",
    "undo_editor_action",
    "redo_editor_action",
    "save_current_scene"
  ]);
  assert.ok(SCENE_TOOL_MANIFEST.every((entry) => entry.category === "scene"));
});

test("script manifest includes bridge and local diagnostic tools", () => {
  validateToolManifest(SCRIPT_TOOL_MANIFEST);

  assert.deepEqual(SCRIPT_TOOL_MANIFEST.map((entry) => entry.name), [
    "read_script",
    "search_in_scripts",
    "write_script",
    "edit_script",
    "open_script",
    "validate_script",
    "diagnose_script",
    "diagnose_project_scripts",
    "get_script_symbols",
    "get_script_editor_state",
    "get_script_cursor_state",
    "goto_script_line",
    "replace_in_scripts",
    "create_script",
    "attach_script"
  ]);
  assert.deepEqual(
    SCRIPT_TOOL_MANIFEST
      .filter((entry) => entry.implementation === "local")
      .map((entry) => entry.name),
    ["diagnose_script", "diagnose_project_scripts"]
  );
  assert.ok(SCRIPT_TOOL_MANIFEST.every((entry) => entry.category === "scripts"));
});

test("viewport manifest preserves bridge tools and adapter metadata", () => {
  validateToolManifest(VIEWPORT_TOOL_MANIFEST);

  assert.deepEqual(VIEWPORT_TOOL_MANIFEST.map((entry) => entry.name), [
    "capture_editor_screenshot",
    "capture_viewport_screenshot",
    "get_viewport_state",
    "set_viewport_camera",
    "send_viewport_input",
    "set_editor_main_screen",
    "invoke_editor_action"
  ]);
  assert.deepEqual(
    VIEWPORT_TOOL_MANIFEST
      .filter((entry) => entry.adapter)
      .map((entry) => [entry.name, entry.adapter.handler]),
    [
      ["capture_editor_screenshot", "captureEditorScreenshot"],
      ["capture_viewport_screenshot", "captureViewportScreenshot"],
      ["send_viewport_input", "sendViewportInput"]
    ]
  );
  assert.ok(VIEWPORT_TOOL_MANIFEST.every((entry) => entry.category === "viewport"));
});

test("toolDefinitionsFromManifest builds MCP handlers from bridge metadata", async () => {
  const tools = toolDefinitionsFromManifest(LOCALIZATION_TOOL_MANIFEST);
  const createCsvTranslation = tools.find((tool) => tool.name === "create_csv_translation");

  let seen = null;
  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    seen = {
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        locale: "en",
        csvPath: "res://locales/en.csv"
      }
    }));
  }, async (port) => {
    const result = await createCsvTranslation.handler({
      port,
      path: "res://locales/en.csv",
      locale: "en",
      messages: { HELLO: "Hello" }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.csvPath, "res://locales/en.csv");
  });

  assert.deepEqual(seen, {
    method: "POST",
    url: "/localization/csv/create",
    body: {
      path: "res://locales/en.csv",
      locale: "en",
      messages: { HELLO: "Hello" }
    }
  });
});

test("toolDefinitionsFromManifest builds MCP handlers from local manifest metadata", async () => {
  const tools = toolDefinitionsFromManifest(SCRIPT_TOOL_MANIFEST, {
    localHandlers: {
      diagnoseGodotScript(args) {
        return {
          ok: true,
          data: {
            path: args.path,
            source: "local"
          }
        };
      }
    }
  });
  const diagnoseScript = tools.find((tool) => tool.name === "diagnose_script");

  const result = await diagnoseScript.handler({
    projectRoot: "/tmp/demo",
    path: "res://scripts/player.gd"
  });
  const payload = parseToolText(result);

  assert.deepEqual(payload, {
    ok: true,
    data: {
      path: "res://scripts/player.gd",
      source: "local"
    }
  });
});

test("toolDefinitionsFromManifest routes adapter bridge tools through registered adapters", async () => {
  const tools = toolDefinitionsFromManifest(VIEWPORT_TOOL_MANIFEST, {
    adapterHandlers: {
      sendViewportInput({ client, payload }) {
        return client.sendViewportInput({
          ...payload,
          normalized: true
        });
      }
    }
  });
  const sendViewportInput = tools.find((tool) => tool.name === "send_viewport_input");

  let seen = null;
  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    seen = {
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        endpoint: req.url
      }
    }));
  }, async (port) => {
    const result = await sendViewportInput.handler({
      port,
      viewport: "2d",
      events: [{ type: "mouse_click", position: [10, 20] }]
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/viewport/input/send");
  });

  assert.deepEqual(seen, {
    method: "POST",
    url: "/viewport/input/send",
    body: {
      viewport: "2d",
      events: [{ type: "mouse_click", position: [10, 20] }],
      normalized: true
    }
  });
});

test("bridgeMethodsFromManifest builds bridge client methods from endpoint metadata", async () => {
  const methods = bridgeMethodsFromManifest(LOCALIZATION_TOOL_MANIFEST);
  assert.deepEqual(Object.keys(methods), [
    "createCsvTranslation",
    "registerTranslationFile",
    "setLocale",
    "getLocalizationState"
  ]);

  const calls = [];
  const client = {
    request(endpoint, options = {}) {
      calls.push({ endpoint, options });
      return { ok: true, data: { endpoint } };
    }
  };

  await methods.setLocale.call(client, { locale: "es" });
  await methods.getLocalizationState.call(client);

  assert.deepEqual(calls, [
    {
      endpoint: "/localization/locale/set",
      options: {
        method: "POST",
        body: { locale: "es" }
      }
    },
    {
      endpoint: "/localization/state",
      options: {
        method: "GET"
      }
    }
  ]);
});

test("bridgeMethodsFromManifest preserves dynamic timeout bridge metadata", async () => {
  const navigationDomain = MIGRATED_MANIFEST_DOMAINS.find((domain) => domain.name === "navigation");
  const methods = bridgeMethodsFromManifest(navigationDomain.manifest);
  const calls = [];
  const client = {
    request(endpoint, options = {}) {
      calls.push({ endpoint, options });
      return { ok: true };
    }
  };

  await methods.bakeNavigationMesh3D.call(client, {
    regionPath: "NavRegion",
    onThread: true,
    timeoutMs: 3000
  });

  assert.deepEqual(calls, [
    {
      endpoint: "/navigation/mesh/bake",
      options: {
        method: "POST",
        body: {
          regionPath: "NavRegion",
          onThread: true
        },
        timeoutMs: 3000,
        operationName: "bake_navigation_mesh_3d",
        partialProgress: {
          regionPath: "NavRegion",
          onThread: true
        }
      }
    }
  ]);
});

test("bridgeMethodsFromManifest builds query strings and computed timeout progress", async () => {
  const importDomain = MIGRATED_MANIFEST_DOMAINS.find((domain) => domain.name === "import");
  const methods = bridgeMethodsFromManifest(importDomain.manifest);
  const calls = [];
  const client = {
    request(endpoint, options = {}) {
      calls.push({ endpoint, options });
      return { ok: true };
    }
  };

  await methods.listImportedAssets.call(client, { recursive: false });
  await methods.getImportEvents.call(client, { kinds: ["sources_changed", "", "resources_reimported"] });
  await methods.reimportAssets.call(client, {
    paths: ["res://a.png", "res://b.png"],
    timeoutMs: 5000
  });

  assert.deepEqual(calls, [
    {
      endpoint: "/import/assets?path=res%3A%2F%2F&recursive=false",
      options: { method: "GET" }
    },
    {
      endpoint: "/import/events?kinds=sources_changed%2Cresources_reimported",
      options: { method: "GET" }
    },
    {
      endpoint: "/import/reimport",
      options: {
        method: "POST",
        body: {
          paths: ["res://a.png", "res://b.png"]
        },
        timeoutMs: 5000,
        operationName: "reimport_assets",
        partialProgress: {
          requestedPaths: 2
        }
      }
    }
  ]);
});

test("bridgeMethodsFromManifest preserves body POSTs for routes whose Godot handler takes no arg", async () => {
  validateToolManifest(RUN_TOOL_MANIFEST);
  const methods = bridgeMethodsFromManifest(RUN_TOOL_MANIFEST);
  const calls = [];
  const client = {
    request(endpoint, options = {}) {
      calls.push({ endpoint, options });
      return { ok: true };
    }
  };

  await methods.stopRunningScene.call(client);

  assert.deepEqual(calls, [
    {
      endpoint: "/run/stop",
      options: {
        method: "POST",
        body: {}
      }
    }
  ]);
});

test("godotRoutesFromManifest exposes read and write route contracts", () => {
  const routes = godotRoutesFromManifest(LOCALIZATION_TOOL_MANIFEST);

  assert.deepEqual(routes.read, [
    {
      endpoint: "/localization/state",
      handler: "_get_localization_state",
      arg: "query"
    }
  ]);
  assert.deepEqual(routes.write, [
    {
      endpoint: "/localization/csv/create",
      handler: "_create_csv_translation",
      arg: "body",
      methodError: "CSV translation creation requires POST"
    },
    {
      endpoint: "/localization/file/register",
      handler: "_register_translation_file",
      arg: "body",
      methodError: "translation file registration requires POST"
    },
    {
      endpoint: "/localization/locale/set",
      handler: "_set_locale",
      arg: "body",
      methodError: "locale set requires POST"
    }
  ]);
});

test("godotRoutesFromManifest preserves write-table method overrides", () => {
  const routes = godotRoutesFromManifest(INSPECTOR_TOOL_MANIFEST);

  assert.deepEqual(routes.read, []);
  assert.deepEqual(routes.write, [
    {
      endpoint: "/inspector/properties",
      handler: "_inspector_properties",
      arg: "query",
      method: ""
    },
    {
      endpoint: "/inspector/property/set",
      handler: "_set_node_property",
      arg: "body",
      methodError: "property set requires POST"
    }
  ]);
});

test("migrated manifest route contracts match committed Godot route catalogs", async () => {
  const routes = godotRoutesFromManifest(MIGRATED_TOOL_MANIFESTS);
  const readCatalog = await readAddonFileExact("niua_mcp_bridge_read_route_catalog.gd");
  const writeTable = await readAddonFileExact("niua_mcp_bridge_write_route_table.gd");

  for (const route of routes.read) {
    const expected = route.arg === "none"
      ? `${escapeRegex(JSON.stringify(route.endpoint))}: \\{ "handler": ${escapeRegex(JSON.stringify(route.handler))} \\}`
      : `${escapeRegex(JSON.stringify(route.endpoint))}: \\{ "handler": ${escapeRegex(JSON.stringify(route.handler))}, "arg": ${escapeRegex(JSON.stringify(route.arg))} \\}`;
    assert.match(
      readCatalog,
      new RegExp(expected)
    );
  }

  for (const route of routes.write) {
    const expected = expectedWriteRouteRegex(route);
    assert.match(
      writeTable,
      new RegExp(expected)
    );
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expectedWriteRouteRegex(route) {
  const fields = [
    `"handler": ${escapeRegex(JSON.stringify(route.handler))}`
  ];
  if (route.arg !== "none") {
    fields.push(`"arg": ${escapeRegex(JSON.stringify(route.arg))}`);
  }
  if (route.methodError !== undefined) {
    fields.push(`"methodError": ${escapeRegex(JSON.stringify(route.methodError))}`);
  }
  if (route.method !== undefined) {
    fields.push(`"method": ${escapeRegex(JSON.stringify(route.method))}`);
  }
  return `${escapeRegex(JSON.stringify(route.endpoint))}: \\{ ${fields.join(", ")} \\}`;
}
