export const EXPORT_PLATFORM_RULES = [
  {
    match: /^linux$/i,
    label: "Linux",
    extensions: [".x86_64", ".x86_32"],
    message: "Linux export paths should end with .x86_64 or .x86_32."
  },
  {
    match: /^windows desktop$/i,
    label: "Windows Desktop",
    extensions: [".exe"],
    message: "Windows Desktop export paths should end with .exe."
  },
  {
    match: /^web$/i,
    label: "Web",
    extensions: [".html"],
    message: "Web export paths should end with .html."
  },
  {
    match: /^macos$/i,
    label: "macOS",
    extensions: [".zip"],
    message: "macOS export paths should end with .zip."
  },
  {
    match: /^android$/i,
    label: "Android",
    extensions: [".apk", ".aab"],
    message: "Android export paths should end with .apk or .aab."
  },
  {
    match: /^ios$/i,
    label: "iOS",
    extensions: [".zip"],
    message: "iOS export paths should end with .zip."
  }
];
