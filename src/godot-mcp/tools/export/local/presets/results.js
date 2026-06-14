import { EXPORT_PLATFORM_RULES } from "./rules.js";

export function validateExportPresetSummary(preset, templateDiagnostics) {
  const errors = [];
  const warnings = [];
  const rule = EXPORT_PLATFORM_RULES.find((candidate) => candidate.match.test(preset.platform));

  if (!preset.name) {
    errors.push(`Preset ${preset.index} is missing a name.`);
  }
  if (!preset.platform) {
    errors.push(`Preset ${preset.name || preset.index} is missing a platform.`);
  }
  if (!preset.exportPath) {
    warnings.push(`Preset ${preset.name || preset.index} has no export_path stored in export_presets.cfg.`);
  }

  if (rule && preset.exportPath && !rule.extensions.some((extension) => preset.exportPath.endsWith(extension))) {
    errors.push(rule.message);
  }
  if (!rule && preset.platform) {
    warnings.push(`No built-in NIUA validation rule for export platform: ${preset.platform}.`);
  }
  if (!templateDiagnostics.installed) {
    warnings.push("Godot export templates are not installed for the current engine version.");
  }

  return {
    preset,
    valid: errors.length === 0,
    rule: rule ? {
      label: rule.label,
      extensions: rule.extensions
    } : null,
    errors,
    warnings
  };
}
