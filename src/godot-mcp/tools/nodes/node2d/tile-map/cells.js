import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeNonNegativeInteger } from "../../../../shared/numbers.js";
import { vector2iToGodotVector } from "../../../../shared/vectors.js";

import { trimOptionalString } from "../builders.js";

export function normalizeTileMapCells(value, {
  allowEmpty = false
} = {}) {
  if (!Array.isArray(value)) {
    throw new Error("cells must be an array");
  }
  if (!allowEmpty && value.length === 0) {
    throw new Error("cells must be non-empty");
  }

  return value.map((rawCell, cellIndex) => {
    const cell = rawCell && typeof rawCell === "object" && !Array.isArray(rawCell)
      ? rawCell
      : {};
    const coords = vector2iToGodotVector(cell.coords, `cells[${cellIndex}].coords`);
    if (cell.erase === true) {
      return {
        coords,
        erase: true
      };
    }

    return {
      coords,
      sourceId: normalizeNonNegativeInteger(cell.sourceId ?? 0, `cells[${cellIndex}].sourceId`),
      atlasCoords: vector2iToGodotVector(cell.atlasCoords ?? [0, 0], `cells[${cellIndex}].atlasCoords`),
      alternativeTile: normalizeNonNegativeInteger(
        cell.alternativeTile ?? 0,
        `cells[${cellIndex}].alternativeTile`
      )
    };
  });
}

export function buildTileMapLayerCellsRequest(payload = {}) {
  const nodePath = trimOptionalString(payload.nodePath);
  if (!nodePath) {
    throw new Error("nodePath is required");
  }

  const clear = Boolean(payload.clear ?? false);
  return {
    nodePath,
    clear,
    cells: normalizeTileMapCells(payload.cells ?? [], { allowEmpty: clear })
  };
}

export async function setTileMapLayerCells(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return client.setTileMapLayerCells(buildTileMapLayerCellsRequest(payload));
}
