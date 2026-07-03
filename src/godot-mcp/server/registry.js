export function createToolRegistry(groups = []) {
  const tools = groups.flat();
  const names = new Set();
  const byName = new Map();

  for (const tool of tools) {
    if (names.has(tool.name)) {
      throw new Error(`duplicate MCP tool: ${tool.name}`);
    }
    names.add(tool.name);
    byName.set(tool.name, tool);
  }

  return {
    // category is internal grouping metadata (dispatch profile); it is stripped
    // from the public MCP tool listing along with the handler.
    definitions: tools.map(({ handler, category, ...definition }) => definition),
    async call(name, args = {}) {
      const tool = byName.get(name);
      if (!tool) {
        throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32601 });
      }
      return tool.handler(args);
    }
  };
}

