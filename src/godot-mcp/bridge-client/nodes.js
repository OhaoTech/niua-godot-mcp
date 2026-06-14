import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { COMMON_NODE_TOOL_MANIFEST } from "../tools/nodes/common/manifest.js";

const NODE_COMMON_BRIDGE_METHODS = bridgeMethodsFromManifest(COMMON_NODE_TOOL_MANIFEST);

export const NODE_BRIDGE_METHODS = {
  ...NODE_COMMON_BRIDGE_METHODS,
  async setTileMapLayerCells(args) {
    return this.request("/scene/tile-map-layer/cells/set", {
      method: "POST",
      body: args
    });
  },

  async paintTileMapLayerTerrain(args) {
    return this.request("/scene/tile-map-layer/terrain/paint", {
      method: "POST",
      body: args
    });
  },

  async assignMaterial(args) {
    return this.request("/node/material/assign", {
      method: "POST",
      body: args
    });
  }
};
