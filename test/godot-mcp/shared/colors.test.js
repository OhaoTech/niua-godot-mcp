import test from "node:test";
import assert from "node:assert/strict";

import {
  colorToGodotColor,
  normalizeColorComponent,
  parseHexColor
} from "../../../src/godot-mcp/shared/colors.js";

test("color helpers convert supported color forms", () => {
  assert.deepEqual(parseHexColor("#336699", "albedoColor"), {
    type: "Color",
    r: 0.2,
    g: 0.4,
    b: 0.6,
    a: 1
  });
  assert.deepEqual(colorToGodotColor([0.1, "0.2", 0.3], "color"), {
    type: "Color",
    r: 0.1,
    g: 0.2,
    b: 0.3,
    a: 1
  });
  assert.deepEqual(colorToGodotColor({ r: 0.1, g: 0.2, b: 0.3, a: 0.4 }, "color"), {
    type: "Color",
    r: 0.1,
    g: 0.2,
    b: 0.3,
    a: 0.4
  });
});

test("color helpers preserve validation errors", () => {
  assert.equal(normalizeColorComponent("0.5", "alpha"), 0.5);
  assert.throws(() => normalizeColorComponent(2, "alpha"), /alpha must be between 0 and 1/);
  assert.throws(() => parseHexColor("#xyz", "albedoColor"), /albedoColor contains non-hex characters/);
  assert.throws(() => colorToGodotColor([1, 1], "color"), /color array must have 3 or 4 entries/);
});

