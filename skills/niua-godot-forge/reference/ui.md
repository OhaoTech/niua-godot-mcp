# ui tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 5 (0 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_ui_control` | full | Create a supported Godot Control node such as Label, Button, Panel, TextureRect, or common containers. | host:string, port:number, expectedProjectRoot:string, type*:enum(Control\|VBoxContainer\|HBoxContainer\|MarginContainer\|CenterContainer\|Label\|Button\|Panel\|TextureRect), name:string, parentPath:string, text:string, tooltip:string, texturePath:string, layout:object |
| `set_control_layout` | full | Set anchors, offsets, minimum size, and size flags on a Godot Control node. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, preset:enum(full_rect\|center\|top_left\|top_wide\|bottom_wide\|left_wide\|right_wide), keepOffsets:boolean, anchors:object, offsets:object, customMinimumSize:object, horizontalSizeFlags:enum(shrink_begin\|fill\|expand\|expand_fill\|shrink_center\|shrink_end), verticalSizeFlags:enum(shrink_begin\|fill\|expand\|expand_fill\|shrink_center\|shrink_end) |
| `create_ui_theme` | full | Create a Godot Theme resource with curated font-size, color, constant, and StyleBoxFlat entries. | host:string, port:number, expectedProjectRoot:string, path*:string, overwrite:boolean, defaultFontSize:integer, typeStyles:array, applyToNodePath:string |
| `apply_ui_theme_override` | full | Assign a Theme resource or per-node Control theme overrides such as font_size and font_color. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, themePath:string, themeTypeVariation:string, fontSizes:object, colors:object, constants:object, styleboxes:object |
| `connect_ui_signal` | full | Connect a UI Control signal, for example Button.pressed, to a target script method. | host:string, port:number, expectedProjectRoot:string, sourcePath*:string, signalName*:string, targetPath*:string, methodName*:string |
