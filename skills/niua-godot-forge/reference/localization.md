# localization tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 4 (0 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_csv_translation` | full | Create a locale CSV plus generated Translation resource, register it, and optionally activate the locale. | host:string, port:number, path*:string, locale*:string, messages*:object, translationPath:string, overwrite:boolean, activate:boolean, save:boolean |
| `register_translation_file` | full | Register a Translation resource path in Godot project localization settings. | host:string, port:number, path*:string, loadNow:boolean, save:boolean |
| `set_locale` | full | Set Godot's active TranslationServer locale. | host:string, port:number, locale*:string |
| `get_localization_state` | full | Read active locale, registered translation resources, loaded locales, and message counts. | host:string, port:number |
