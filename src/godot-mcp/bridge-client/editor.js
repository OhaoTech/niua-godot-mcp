export const EDITOR_BRIDGE_METHODS = {
  async health() {
    return this.request("/health");
  },

  async getProjectInfo() {
    return this.request("/project/info");
  },

  async getEditorState() {
    return this.request("/editor/state");
  },

  async getSelection() {
    return this.request("/selection");
  },

  async setSelection(args) {
    return this.request("/selection/set", {
      method: "POST",
      body: args
    });
  },

  async focusNode(args) {
    return this.request("/selection/focus/node", {
      method: "POST",
      body: args
    });
  },

  async getLogs() {
    return this.request("/logs");
  },

  async captureEditorScreenshot() {
    return this.request("/editor/screenshot");
  },

  async setEditorMainScreen(args) {
    return this.request("/editor/main-screen/set", {
      method: "POST",
      body: args
    });
  },

  async invokeEditorAction(args) {
    return this.request("/editor/action/invoke", {
      method: "POST",
      body: args
    });
  },

  async undoEditorAction(args = {}) {
    return this.request("/editor/undo", {
      method: "POST",
      body: args
    });
  },

  async redoEditorAction(args = {}) {
    return this.request("/editor/redo", {
      method: "POST",
      body: args
    });
  }
};
