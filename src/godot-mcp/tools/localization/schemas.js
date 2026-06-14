import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const MESSAGES_SCHEMA = {
  type: "object",
  additionalProperties: {
    type: "string"
  },
  description: "Source message keys mapped to translated text."
};

export const CREATE_CSV_TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Output CSV path under res://, usually res://locales/en.csv."
    },
    locale: {
      type: "string",
      description: "Translation locale, for example en or es."
    },
    messages: MESSAGES_SCHEMA,
    translationPath: {
      type: "string",
      description: "Optional generated .translation resource path. Defaults beside the CSV."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite existing CSV/resource files. Defaults to false."
    },
    activate: {
      type: "boolean",
      description: "Set TranslationServer locale to this locale after creation."
    },
    save: {
      type: "boolean",
      description: "Persist project settings after registration. Defaults to true."
    }
  },
  required: ["path", "locale", "messages"],
  additionalProperties: false
};

export const REGISTER_TRANSLATION_FILE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Translation resource path under res:// to register in project settings."
    },
    loadNow: {
      type: "boolean",
      description: "Load and add the translation to TranslationServer immediately. Defaults to true for .translation resources."
    },
    save: {
      type: "boolean",
      description: "Persist project settings after registration. Defaults to true."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const SET_LOCALE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    locale: {
      type: "string",
      description: "Locale to activate through TranslationServer.set_locale."
    }
  },
  required: ["locale"],
  additionalProperties: false
};

export const GET_LOCALIZATION_STATE_SCHEMA = {
  type: "object",
  properties: CONNECTION_PROPERTIES,
  additionalProperties: false
};
