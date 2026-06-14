import { installAddon } from "../../../../../../scripts/install-niua-godot-addon.js";

export async function installProjectAddonForLaunch(args = {}, projectRoot) {
  if (args.installAddon === false) {
    return null;
  }
  return installAddon({ projectRoot });
}
