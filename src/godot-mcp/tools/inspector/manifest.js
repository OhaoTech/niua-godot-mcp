import { INSPECTOR_PROPERTIES_SCHEMA, SET_NODE_PROPERTY_SCHEMA } from "./schemas.js";

export const INSPECTOR_TOOL_MANIFEST = [
  {
    name: "get_inspector_properties",
    description: "Read inspector-style editable properties for a selected or addressed node.",
    profile: "full",
    category: "inspector",
    inputSchema: INSPECTOR_PROPERTIES_SCHEMA,
    bridge: {
      owner: "inspector",
      clientMethod: "getInspectorProperties",
      endpoint: "/inspector/properties",
      method: "GET",
      request: "query",
      query: {
        fields: {
          nodePath: { default: "" }
        }
      }
    },
    godotRoute: {
      side: "write",
      endpoint: "/inspector/properties",
      handler: "_inspector_properties",
      arg: "query",
      method: ""
    },
    conformance: {
      happy: "read inspector-style editable properties",
      error: "return an empty property list when no target node is selected"
    },
    docs: {
      summary: "Reads inspector-style editable properties for a selected or addressed node."
    }
  },
  {
    name: "set_node_property",
    description: "Set a property on a node in the current edited Godot scene.",
    profile: "full",
    category: "inspector",
    inputSchema: SET_NODE_PROPERTY_SCHEMA,
    bridge: {
      owner: "inspector",
      clientMethod: "setNodeProperty",
      endpoint: "/inspector/property/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/inspector/property/set",
      handler: "_set_node_property",
      arg: "body",
      methodError: "property set requires POST"
    },
    conformance: {
      happy: "set a property on a scene node",
      error: "reject invalid node paths or property names"
    },
    docs: {
      summary: "Sets a property on a node in the current edited Godot scene."
    }
  }
];
