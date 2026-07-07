import {
  CREATE_CSV_TRANSLATION_SCHEMA,
  GET_LOCALIZATION_STATE_SCHEMA,
  REGISTER_TRANSLATION_FILE_SCHEMA,
  SET_LOCALE_SCHEMA
} from "./schemas.js";

export const LOCALIZATION_TOOL_MANIFEST = [
  {
    name: "create_csv_translation",
    stability: "experimental",
    description: "Create a locale CSV plus generated Translation resource, register it, and optionally activate the locale.",
    profile: "full",
    tier: "standard",
    category: "localization",
    inputSchema: CREATE_CSV_TRANSLATION_SCHEMA,
    bridge: {
      clientMethod: "createCsvTranslation",
      endpoint: "/localization/csv/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/localization/csv/create",
      handler: "_create_csv_translation",
      arg: "body",
      methodError: "CSV translation creation requires POST"
    },
    conformance: {
      happy: "create a CSV translation from locale messages",
      error: "reject translation CSV paths outside res://"
    },
    docs: {
      summary: "Creates a locale CSV translation resource and optionally activates it."
    }
  },
  {
    name: "register_translation_file",
    stability: "experimental",
    description: "Register a Translation resource path in Godot project localization settings.",
    profile: "full",
    tier: "standard",
    category: "localization",
    inputSchema: REGISTER_TRANSLATION_FILE_SCHEMA,
    bridge: {
      clientMethod: "registerTranslationFile",
      endpoint: "/localization/file/register",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/localization/file/register",
      handler: "_register_translation_file",
      arg: "body",
      methodError: "translation file registration requires POST"
    },
    conformance: {
      happy: "register a generated translation resource",
      error: "reject translation resource paths outside res://"
    },
    docs: {
      summary: "Registers a Translation resource in project localization settings."
    }
  },
  {
    name: "set_locale",
    stability: "experimental",
    description: "Set Godot's active TranslationServer locale.",
    profile: "full",
    tier: "standard",
    category: "localization",
    inputSchema: SET_LOCALE_SCHEMA,
    bridge: {
      clientMethod: "setLocale",
      endpoint: "/localization/locale/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/localization/locale/set",
      handler: "_set_locale",
      arg: "body",
      methodError: "locale set requires POST"
    },
    conformance: {
      happy: "activate a locale",
      error: "reject missing locale"
    },
    docs: {
      summary: "Sets the active TranslationServer locale."
    }
  },
  {
    name: "get_localization_state",
    stability: "experimental",
    description: "Read active locale, registered translation resources, loaded locales, and message counts. loadedLocales and translations are sorted by locale; registeredTranslations keeps project-settings order.",
    profile: "full",
    tier: "standard",
    category: "localization",
    inputSchema: GET_LOCALIZATION_STATE_SCHEMA,
    bridge: {
      clientMethod: "getLocalizationState",
      endpoint: "/localization/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/localization/state",
      handler: "_get_localization_state",
      arg: "query"
    },
    conformance: {
      happy: "read localization state",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads current locale and registered translation state."
    }
  }
];
