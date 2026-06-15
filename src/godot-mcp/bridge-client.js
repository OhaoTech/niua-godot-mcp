import path from "node:path";

import { DEBUGGER_BRIDGE_METHODS } from "./bridge-client/debugger.js";
import { ANIMATION_BRIDGE_METHODS } from "./bridge-client/animation.js";
import { AUDIO_BRIDGE_METHODS } from "./bridge-client/audio.js";
import { EDITOR_BRIDGE_METHODS } from "./bridge-client/editor.js";
import { EXPORT_BRIDGE_METHODS } from "./bridge-client/exports.js";
import { FILESYSTEM_BRIDGE_METHODS } from "./bridge-client/filesystem.js";
import { IMPORT_BRIDGE_METHODS } from "./bridge-client/imports.js";
import { INSPECTOR_BRIDGE_METHODS } from "./bridge-client/inspector.js";
import { LOCALIZATION_BRIDGE_METHODS } from "./bridge-client/localization.js";
import { MULTIPLAYER_BRIDGE_METHODS } from "./bridge-client/multiplayer.js";
import { NAVIGATION_BRIDGE_METHODS } from "./bridge-client/navigation.js";
import { NODE_BRIDGE_METHODS } from "./bridge-client/nodes.js";
import { PARTICLES_BRIDGE_METHODS } from "./bridge-client/particles.js";
import { PROJECT_BRIDGE_METHODS } from "./bridge-client/project.js";
import { RESOURCE_BRIDGE_METHODS } from "./bridge-client/resources.js";
import { RUN_BRIDGE_METHODS } from "./bridge-client/run.js";
import { RUNTIME_BRIDGE_METHODS } from "./bridge-client/runtime.js";
import { SCENE_BRIDGE_METHODS } from "./bridge-client/scene.js";
import { SCRIPT_BRIDGE_METHODS } from "./bridge-client/scripts.js";
import { UI_BRIDGE_METHODS } from "./bridge-client/ui.js";
import { VIEWPORT_BRIDGE_METHODS } from "./bridge-client/viewport.js";
import { normalizeBridgeResponse } from "./protocol.js";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 9174;

export class GodotBridgeClient {
  constructor({
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
    token = null,
    expectedProjectRoot = "",
    fetchImpl = globalThis.fetch
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("GodotBridgeClient requires a fetch implementation");
    }

    this.host = host;
    this.port = port;
    this.token = token;
    this.expectedProjectRoot = normalizeProjectRoot(expectedProjectRoot);
    this._verifiedProjectRoot = null;
    this.fetchImpl = fetchImpl;
  }

  async request(endpoint, {
    method = "GET",
    body,
    timeoutMs,
    operationName = endpoint,
    partialProgress = null,
    skipProjectIdentityCheck = false
  } = {}) {
    if (!skipProjectIdentityCheck) {
      await this.verifyProjectIdentity(endpoint);
    }

    const url = new URL(endpoint, `http://${this.host}:${this.port}`);
    const headers = {
      accept: "application/json"
    };
    if (this.token) {
      headers["x-niua-mcp-token"] = this.token;
    }
    const options = { method, headers };

    if (body !== undefined) {
      headers["content-type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const normalizedTimeoutMs = normalizeRequestTimeoutMs(timeoutMs);
    let timeout = null;
    const controller = normalizedTimeoutMs ? new AbortController() : null;
    if (controller) {
      options.signal = controller.signal;
      timeout = setTimeout(() => controller.abort(), normalizedTimeoutMs);
    }

    let response;
    try {
      response = await this.fetchImpl(url, {
        ...options
      });
    } catch (error) {
      if (controller?.signal.aborted) {
        throw new Error(
          `Godot bridge operation ${operationName} timed out after ${normalizedTimeoutMs}ms for ${endpoint}. ` +
            `partialProgress: ${formatPartialProgress(partialProgress)}. ` +
            "Increase timeoutMs, reduce the batch size, verify the editor is responsive, or run diagnose_project_setup with checkBridge=true."
        );
      }
      throw new Error(
        `Godot bridge is not reachable at ${this.host}:${this.port} for ${endpoint}: ${error.message}. ` +
          "Open the project with open_project, verify the NIUA addon is installed, or run diagnose_project_setup with checkBridge=true."
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = await response.text();
    let payload;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new Error(`Godot bridge returned invalid JSON from ${endpoint}: ${error.message}`);
    }

    if (!response.ok) {
      const message = payload?.error ?? payload?.message ?? response.statusText;
      throw new Error(`Godot bridge returned ${response.status} for ${endpoint}: ${message}`);
    }

    return normalizeBridgeResponse(payload);
  }

  async verifyProjectIdentity(endpoint = "") {
    if (!this.expectedProjectRoot || endpoint === "/project/info") {
      return;
    }
    if (this._verifiedProjectRoot === this.expectedProjectRoot) {
      return;
    }

    const projectInfo = await this.request("/project/info", {
      operationName: "project_identity",
      skipProjectIdentityCheck: true
    });
    const actualProjectRoot = normalizeProjectRoot(projectInfo?.data?.projectRoot);
    if (!actualProjectRoot) {
      throw new Error(
        `Godot bridge project root check failed for ${this.host}:${this.port}: /project/info did not return data.projectRoot.`
      );
    }
    if (actualProjectRoot !== this.expectedProjectRoot) {
      throw new Error(
        `Godot bridge project root mismatch for ${this.host}:${this.port}: ` +
          `expected ${this.expectedProjectRoot}, got ${actualProjectRoot}. ` +
          "Use the bridge port for the intended project or pass the matching expectedProjectRoot."
      );
    }

    this._verifiedProjectRoot = actualProjectRoot;
  }
}

function normalizeProjectRoot(projectRoot) {
  if (projectRoot === undefined || projectRoot === null || projectRoot === "") {
    return "";
  }
  return path.resolve(String(projectRoot));
}

function normalizeRequestTimeoutMs(timeoutMs) {
  if (timeoutMs === undefined || timeoutMs === null || timeoutMs === "") {
    return null;
  }

  const value = Number(timeoutMs);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.trunc(value);
}

function formatPartialProgress(partialProgress) {
  if (!partialProgress || typeof partialProgress !== "object") {
    return "none reported";
  }

  const parts = Object.entries(partialProgress)
    .map(([key, value]) => `${key}: ${String(value)}`);

  return parts.length > 0 ? parts.join(", ") : "none reported";
}

Object.assign(
  GodotBridgeClient.prototype,
  EDITOR_BRIDGE_METHODS,
  PROJECT_BRIDGE_METHODS,
  IMPORT_BRIDGE_METHODS,
  RUN_BRIDGE_METHODS,
  EXPORT_BRIDGE_METHODS,
  DEBUGGER_BRIDGE_METHODS,
  ANIMATION_BRIDGE_METHODS,
  VIEWPORT_BRIDGE_METHODS,
  FILESYSTEM_BRIDGE_METHODS,
  RESOURCE_BRIDGE_METHODS,
  SCRIPT_BRIDGE_METHODS,
  SCENE_BRIDGE_METHODS,
  UI_BRIDGE_METHODS,
  PARTICLES_BRIDGE_METHODS,
  NAVIGATION_BRIDGE_METHODS,
  AUDIO_BRIDGE_METHODS,
  LOCALIZATION_BRIDGE_METHODS,
  MULTIPLAYER_BRIDGE_METHODS,
  NODE_BRIDGE_METHODS,
  INSPECTOR_BRIDGE_METHODS,
  RUNTIME_BRIDGE_METHODS
);
