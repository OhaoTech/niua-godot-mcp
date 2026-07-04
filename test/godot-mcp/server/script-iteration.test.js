import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

// Script-iteration trio: search_in_scripts + ranged read_script + edit_script.
// Bridge fixtures mirror the addon sources they stand in for:
// - niua_mcp_script_search_operations.gd (search_in_scripts)
// - niua_mcp_script_edit_operations.gd (edit_script)
// - niua_mcp_filesystem_read_operations.gd _ranged_text_response (ranged reads)

function parseToolText(response) {
  return JSON.parse(response.result.content[0].text);
}

test("Godot MCP server forwards search_in_scripts queries and surfaces matches and truncation", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/script/search" || req.method !== "GET") {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, error: "not found" }));
      return;
    }
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");
    if (url.searchParams.get("maxResults") === "1") {
      // Truncation: totalMatches keeps counting past the cap.
      res.end(JSON.stringify({
        ok: true,
        data: {
          query: url.searchParams.get("query"),
          matches: [{ path: "res://scripts/enemy.gd", line: 4, text: "var speed := 4.5" }],
          totalMatches: 3,
          truncated: true
        }
      }));
      return;
    }
    res.end(JSON.stringify({
      ok: true,
      data: {
        query: url.searchParams.get("query"),
        matches: [
          { path: "res://scripts/enemy.gd", line: 4, text: "var speed := 4.5" },
          { path: "res://scripts/player.gd", line: 11, text: "speed = clamp(speed, 0.0, MAX_SPEED)" }
        ],
        totalMatches: 2,
        truncated: false
      }
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const full = parseToolText(await server.request("tools/call", {
        name: "search_in_scripts",
        arguments: {
          query: "speed",
          pathPrefix: "res://scripts",
          exclude: ["addons", ".godot"],
          caseSensitive: false
        }
      }));
      assert.equal(full.ok, true);
      assert.equal(full.data.totalMatches, 2);
      assert.equal(full.data.truncated, false);
      assert.deepEqual(full.data.matches[0], {
        path: "res://scripts/enemy.gd",
        line: 4,
        text: "var speed := 4.5"
      });

      const truncated = parseToolText(await server.request("tools/call", {
        name: "search_in_scripts",
        arguments: { query: "speed", maxResults: 1 }
      }));
      assert.equal(truncated.data.truncated, true);
      assert.equal(truncated.data.totalMatches, 3);
      assert.equal(truncated.data.matches.length, 1);
    } finally {
      await server.close();
    }
  });

  const [fullUrl, truncatedUrl] = seenUrls;
  assert.equal(
    fullUrl,
    "/script/search?query=speed&pathPrefix=res%3A%2F%2Fscripts&exclude=addons%2C.godot&caseSensitive=false"
  );
  assert.equal(truncatedUrl, "/script/search?query=speed&maxResults=1");
});

test("Godot MCP server surfaces search_in_scripts invalid-regex errors naming the pattern", async () => {
  await withBridgeServer((req, res) => {
    res.setHeader("content-type", "application/json");
    // niua_mcp_script_search_operations.gd invalid-pattern rejection
    res.end(JSON.stringify({
      ok: false,
      error: "invalid regex pattern: speed( (fix the pattern or set regex:false for plain-text search)",
      errorCode: "bad_request"
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const payload = parseToolText(await server.request("tools/call", {
        name: "search_in_scripts",
        arguments: { query: "speed(", regex: true }
      }));
      assert.equal(payload.ok, false);
      assert.match(payload.error, /invalid regex pattern: speed\(/);
      assert.match(payload.error, /regex:false/);
      assert.equal(payload.errorCode, "bad_request");
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards ranged read_script calls and keeps totalLines", async () => {
  let seenUrl = null;

  await withBridgeServer((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    // niua_mcp_filesystem_read_operations.gd _ranged_text_response
    res.end(JSON.stringify({
      ok: true,
      data: {
        path: "res://scripts/player.gd",
        content: "const MAX_SPEED := 10",
        bytes: 21,
        totalLines: 42,
        lineStart: 7
      }
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const payload = parseToolText(await server.request("tools/call", {
        name: "read_script",
        arguments: { path: "res://scripts/player.gd", lineStart: 7, lineCount: 1 }
      }));
      assert.equal(payload.data.content, "const MAX_SPEED := 10");
      assert.equal(payload.data.totalLines, 42);
      assert.equal(payload.data.lineStart, 7);
    } finally {
      await server.close();
    }
  });

  assert.equal(seenUrl, "/script/read?path=res%3A%2F%2Fscripts%2Fplayer.gd&lineStart=7&lineCount=1");
});

test("Godot MCP server forwards ranged read_text_file calls symmetrically", async () => {
  let seenUrl = null;

  await withBridgeServer((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        path: "res://README.md",
        content: "# Title",
        bytes: 7,
        totalLines: 9,
        lineStart: 1
      }
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const payload = parseToolText(await server.request("tools/call", {
        name: "read_text_file",
        arguments: { path: "res://README.md", lineStart: 1, lineCount: 1 }
      }));
      assert.equal(payload.data.totalLines, 9);
      assert.equal(payload.data.lineStart, 1);
    } finally {
      await server.close();
    }
  });

  assert.equal(seenUrl, "/filesystem/file/read?path=res%3A%2F%2FREADME.md&lineStart=1&lineCount=1");
});

test("Godot MCP server forwards edit_script bodies and surfaces the read-back truth", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url !== "/script/edit" || req.method !== "POST") {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, error: "not found" }));
      return;
    }
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    // niua_mcp_script_edit_operations.gd success read-back
    res.end(JSON.stringify({
      ok: true,
      data: {
        path: "res://scripts/player.gd",
        replacements: 1,
        totalLines: 42,
        valid: true,
        parseErrors: []
      }
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const payload = parseToolText(await server.request("tools/call", {
        name: "edit_script",
        arguments: {
          path: "res://scripts/player.gd",
          oldText: "speed := 4.5",
          newText: "speed := 6.0"
        }
      }));
      assert.equal(payload.ok, true);
      assert.equal(payload.data.replacements, 1);
      assert.equal(payload.data.totalLines, 42);
      assert.equal(payload.data.valid, true);
      assert.deepEqual(payload.data.parseErrors, []);
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(receivedBody, {
    path: "res://scripts/player.gd",
    oldText: "speed := 4.5",
    newText: "speed := 6.0"
  });
});

test("Godot MCP server surfaces edit_script not-found, conflict, and parse-invalid truths", async () => {
  // Fixtures mirror niua_mcp_script_edit_operations.gd error/parse paths.
  const fixtures = {
    missing: {
      ok: false,
      error: "oldText not found in res://scripts/player.gd (read_script the file to see current content)",
      errorCode: "not_found"
    },
    ambiguous: {
      ok: false,
      error: "oldText matches 3 locations in res://scripts/player.gd: make oldText unique by including surrounding lines, or pass replaceAll:true",
      errorCode: "conflict"
    },
    broken: {
      // The edit DID happen: ok stays true and valid:false carries the parse truth.
      ok: true,
      data: {
        path: "res://scripts/player.gd",
        replacements: 1,
        totalLines: 42,
        valid: false,
        parseErrors: [
          "GDScript reload failed with Godot error 43 (run diagnose_script for line-level parser output)"
        ]
      }
    }
  };

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(fixtures[body.oldText]));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const missing = parseToolText(await server.request("tools/call", {
        name: "edit_script",
        arguments: { path: "res://scripts/player.gd", oldText: "missing", newText: "x" }
      }));
      assert.equal(missing.ok, false);
      assert.match(missing.error, /oldText not found in res:\/\/scripts\/player\.gd/);
      assert.match(missing.error, /read_script the file to see current content/);
      assert.equal(missing.errorCode, "not_found");

      const ambiguous = parseToolText(await server.request("tools/call", {
        name: "edit_script",
        arguments: { path: "res://scripts/player.gd", oldText: "ambiguous", newText: "x" }
      }));
      assert.equal(ambiguous.ok, false);
      assert.match(ambiguous.error, /matches 3 locations/);
      assert.match(ambiguous.error, /pass replaceAll:true/);
      assert.equal(ambiguous.errorCode, "conflict");

      const broken = parseToolText(await server.request("tools/call", {
        name: "edit_script",
        arguments: { path: "res://scripts/player.gd", oldText: "broken", newText: "x" }
      }));
      assert.equal(broken.ok, true, "a parse-breaking edit still succeeded — the write happened");
      assert.equal(broken.data.valid, false);
      assert.equal(broken.data.replacements, 1);
      assert.match(broken.data.parseErrors[0], /diagnose_script/);
    } finally {
      await server.close();
    }
  });
});
