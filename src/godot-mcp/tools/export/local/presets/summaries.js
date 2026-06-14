export function exportPresetSummariesFromSections(sections) {
  return Object.entries(sections)
    .filter(([section]) => /^preset\.\d+$/.test(section))
    .map(([section, values]) => {
      const index = Number(section.slice("preset.".length));
      return {
        index,
        name: String(values.name ?? ""),
        platform: String(values.platform ?? ""),
        exportPath: String(values.export_path ?? ""),
        runnable: Boolean(values.runnable ?? true),
        options: sections[`${section}.options`] ?? {}
      };
    })
    .sort((left, right) => left.index - right.index);
}
