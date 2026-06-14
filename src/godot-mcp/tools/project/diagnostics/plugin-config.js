export function projectTextHasEnabledNiuaPlugin(projectText) {
  const sectionStart = projectText.search(/^[ \t]*\[editor_plugins\][ \t]*$/m);
  if (sectionStart === -1) {
    return false;
  }

  const sectionText = projectText.slice(sectionStart);
  const sectionEnd = sectionText.slice(1).search(/^[ \t]*\[.*\][ \t]*$/m);
  const editorPluginsSection = sectionEnd === -1
    ? sectionText
    : sectionText.slice(0, sectionEnd + 1);

  return editorPluginsSection.includes("res://addons/niua_mcp/plugin.cfg");
}
