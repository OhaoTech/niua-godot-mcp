export function bridgeRecoveryActions({
  projectRoot,
  host,
  port,
  addonFilesReady: hasAddonFiles,
  pluginEnabled
}) {
  const actions = [];

  if (!hasAddonFiles || !pluginEnabled) {
    actions.push({
      code: "install_or_repair_addon",
      title: "Install or repair the NIUA Godot editor addon",
      detail: "Use this when addon files are missing or the editor plugin is not enabled in project.godot.",
      toolCall: {
        name: "install_project_addon",
        arguments: {
          projectRoot
        }
      }
    });
  }

  if (hasAddonFiles && pluginEnabled) {
    actions.push({
      code: "restart_or_toggle_plugin",
      title: "Restart Godot or toggle the NIUA editor plugin",
      detail: "When a project is already open but the bridge is offline, restart the editor or toggle NIUA Godot MCP in Project Settings > Plugins so the plugin enters the tree and starts its localhost bridge."
    });
  }

  actions.push({
    code: "open_project_with_bridge",
    title: "Open the project through the MCP server and wait for the bridge",
    detail: "This launches Godot with the expected bridge port environment and repairs the addon before launch.",
    toolCall: {
      name: "open_project",
      arguments: {
        projectRoot,
        installAddon: true,
        waitForBridge: true,
        bridgeHost: host,
        bridgePort: port
      }
    }
  });

  actions.push({
    code: "discover_editor_bridges",
    title: "Discover active NIUA bridges on nearby local ports",
    detail: "Use this if the editor was started with a different NIUA_MCP_PORT or GODOT_MCP_PORT.",
    toolCall: {
      name: "discover_editor_bridges",
      arguments: {
        host,
        startPort: 9174,
        endPort: 9194,
        includeUnavailable: false
      }
    }
  });

  return actions;
}
