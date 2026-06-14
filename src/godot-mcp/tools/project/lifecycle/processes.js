import { normalizePositiveInteger } from "../../../shared/numbers.js";
import {
  findOpenProjectEntry,
  openProjectProcesses,
  serializeProjectProcess,
  waitForProjectExit
} from "../../../services/process-manager.js";

export async function listOpenGodotProjects(args = {}) {
  const activeOnly = Boolean(args.activeOnly ?? false);
  const projects = [...openProjectProcesses.values()]
    .filter((entry) => !activeOnly || entry.status === "running")
    .map((entry) => serializeProjectProcess(entry));

  return {
    ok: true,
    data: {
      projects
    }
  };
}

export async function closeGodotProject(args = {}) {
  const entry = findOpenProjectEntry(args);
  if (!entry) {
    const selector = args.projectId ?? args.projectRoot ?? "provided selector";
    throw new Error(
      `no matching open Godot project was found for ${selector}; ` +
        "run get_open_projects to list active projectId/projectRoot values before retrying close_project"
    );
  }

  const signal = String(args.signal ?? "SIGTERM");
  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 3000);
  if (entry.status === "running") {
    entry.closeRequestedAt = new Date().toISOString();
    entry.closeSignal = signal;
    entry.child.kill(signal);

    const exited = await waitForProjectExit(entry, timeoutMs);
    if (!exited && entry.status === "running") {
      entry.closeSignal = "SIGKILL";
      entry.child.kill("SIGKILL");
      await waitForProjectExit(entry, 1000);
    }
  }

  return {
    ok: true,
    data: serializeProjectProcess(entry)
  };
}
