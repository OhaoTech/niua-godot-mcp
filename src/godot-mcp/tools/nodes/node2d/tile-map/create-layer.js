import { splitBridgeArgs } from "../../../../server/context.js";

import {
  buildNodeCreateRequest,
  resolveCreatedNodePath,
  trimOptionalString
} from "../builders.js";
import { normalizeTileMapCells } from "./cells.js";
import { buildTileMapLayerProperties } from "./properties.js";
import {
  buildGeneratedTileSetRequest,
  defaultTileSetPath,
  normalizeResPath
} from "./tile-set.js";

export async function createTileMapLayer(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const name = trimOptionalString(payload.name) || "TileMapLayer";
  let tileSetPath = trimOptionalString(payload.tileSetPath);
  let createdTileSet = null;

  if (tileSetPath) {
    tileSetPath = normalizeResPath(tileSetPath, "tileSetPath");
  } else {
    tileSetPath = trimOptionalString(payload.tileSetResourcePath) || defaultTileSetPath(name);
    const tileSetRequest = buildGeneratedTileSetRequest(payload, tileSetPath);
    createdTileSet = await client.createTileSet(tileSetRequest);
    if (!createdTileSet.ok) {
      return {
        ok: false,
        error: createdTileSet.error,
        data: {
          type: "TileMapLayer",
          tileSetPath,
          createdTileSet
        }
      };
    }
  }

  const properties = buildTileMapLayerProperties(payload, tileSetPath);
  const createdNode = await client.createNode(
    buildNodeCreateRequest("TileMapLayer", payload, properties)
  );
  if (!createdNode.ok) {
    return {
      ok: false,
      error: createdNode.error,
      data: {
        type: "TileMapLayer",
        tileSetPath,
        properties,
        tileSet: createdTileSet?.data ?? null,
        createdTileSet,
        createdNode
      }
    };
  }

  let cellsResult = null;
  if (payload.cells !== undefined || payload.clearCells === true) {
    const nodePath = resolveCreatedNodePath(createdNode, name, payload.parentPath);
    cellsResult = await client.setTileMapLayerCells({
      nodePath,
      clear: Boolean(payload.clearCells ?? false),
      cells: normalizeTileMapCells(payload.cells ?? [], { allowEmpty: payload.clearCells === true })
    });
    if (!cellsResult.ok) {
      return {
        ok: false,
        error: cellsResult.error,
        data: {
          type: "TileMapLayer",
          tileSetPath,
          properties,
          tileSet: createdTileSet?.data ?? null,
          node: createdNode.data,
          createdTileSet,
          createdNode,
          cellsResult
        }
      };
    }
  }

  return {
    ok: true,
    data: {
      type: "TileMapLayer",
      tileSetPath,
      properties,
      tileSet: createdTileSet?.data ?? null,
      node: createdNode.data,
      cells: cellsResult?.data ?? null,
      createdTileSet,
      createdNode,
      cellsResult
    }
  };
}
