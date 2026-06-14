export function parseGodotConfig(text) {
  const sections = {};
  let currentSection = null;

  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) {
      continue;
    }

    const sectionMatch = /^\[([^\]]+)\]$/.exec(line);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = sections[currentSection] ?? {};
      continue;
    }

    if (!currentSection) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = parseGodotConfigValue(line.slice(separator + 1).trim());
    sections[currentSection][key] = value;
  }

  return sections;
}

function parseGodotConfigValue(value) {
  if (value.startsWith("\"") && value.endsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }

  if (value === "true") return true;
  if (value === "false") return false;

  const number = Number(value);
  if (Number.isFinite(number) && value !== "") {
    return number;
  }

  return value;
}
