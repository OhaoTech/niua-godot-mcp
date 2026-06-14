export const GET_OPEN_PROJECTS_SCHEMA = {
  type: "object",
  properties: {
    activeOnly: {
      type: "boolean",
      description: "Only return projects whose editor process is still running. Defaults to false."
    }
  },
  additionalProperties: false
};

export const CLOSE_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectId: {
      type: "string",
      description: "Tracked project process id returned by open_project."
    },
    projectRoot: {
      type: "string",
      description: "Allowlisted project root to close when projectId is not provided."
    },
    signal: {
      type: "string",
      description: "Process signal to send first. Defaults to SIGTERM."
    },
    timeoutMs: {
      type: "number",
      description: "Milliseconds to wait before escalating to SIGKILL. Defaults to 3000."
    }
  },
  additionalProperties: false
};
