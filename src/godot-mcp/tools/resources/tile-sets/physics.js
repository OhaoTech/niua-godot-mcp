import {
  normalizeNonNegativeFiniteNumber,
  normalizeObject,
  normalizePositiveBitMask,
  normalizeResPath
} from "./shared.js";

function normalizePhysicsLayer(value, fieldName) {
  const layer = normalizeObject(value, fieldName);
  const request = {
    collisionLayer: normalizePositiveBitMask(
      layer.collisionLayer ?? 1,
      `${fieldName}.collisionLayer`
    ),
    collisionMask: normalizePositiveBitMask(
      layer.collisionMask ?? 1,
      `${fieldName}.collisionMask`
    ),
    collisionPriority: normalizeNonNegativeFiniteNumber(
      layer.collisionPriority ?? 1,
      `${fieldName}.collisionPriority`
    )
  };

  if (layer.physicsMaterialPath !== undefined) {
    request.physicsMaterialPath = normalizeResPath(
      layer.physicsMaterialPath,
      `${fieldName}.physicsMaterialPath`
    );
  }

  return request;
}

export function normalizePhysicsLayers(value, {
  required = false
} = {}) {
  if (value === undefined) {
    return required
      ? [
          {
            collisionLayer: 1,
            collisionMask: 1,
            collisionPriority: 1
          }
        ]
      : [];
  }
  if (!Array.isArray(value)) {
    throw new Error("physicsLayers must be an array");
  }
  return value.map((layer, layerIndex) => normalizePhysicsLayer(
    layer,
    `physicsLayers[${layerIndex}]`
  ));
}

export function validateCollisionPolygonLayers(sources, physicsLayers) {
  sources.forEach((source, sourceIndex) => {
    source.tiles.forEach((tile, tileIndex) => {
      const polygons = tile.collisionPolygons ?? [];
      polygons.forEach((polygon, polygonIndex) => {
        if (polygon.layer >= physicsLayers.length) {
          throw new Error(
            `sources[${sourceIndex}].tiles[${tileIndex}]` +
              `.collisionPolygons[${polygonIndex}].layer must reference ` +
              "an existing physicsLayers entry"
          );
        }
      });
    });
  });
}
