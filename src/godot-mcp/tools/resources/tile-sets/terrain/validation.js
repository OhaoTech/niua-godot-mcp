export function validateTileTerrains(sources, terrainSets) {
  sources.forEach((source, sourceIndex) => {
    source.tiles.forEach((tile, tileIndex) => {
      const terrain = tile.terrain;
      if (terrain === undefined) {
        return;
      }

      const terrainSet = terrainSets[terrain.terrainSet];
      if (!terrainSet) {
        throw new Error(
          `sources[${sourceIndex}].tiles[${tileIndex}].terrain.terrainSet ` +
            "must reference an existing terrainSets entry"
        );
      }
      if (!terrainSet.terrains[terrain.terrain]) {
        throw new Error(
          `sources[${sourceIndex}].tiles[${tileIndex}].terrain.terrain ` +
            "must reference an existing terrain"
        );
      }

      terrain.peeringBits.forEach((bit, bitIndex) => {
        if (bit.terrain >= terrainSet.terrains.length) {
          throw new Error(
            `sources[${sourceIndex}].tiles[${tileIndex}].terrain` +
              `.peeringBits[${bitIndex}].terrain must reference an existing terrain`
          );
        }
      });
    });
  });
}
