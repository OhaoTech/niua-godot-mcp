# audio tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 5 (0 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `list_audio_buses` | full | Read Godot's current audio bus layout, including effects, volume, mute, and send routing. | host:string, port:number, expectedProjectRoot:string |
| `upsert_audio_bus` | full | Create, rename, route, mute, or set volume for an audio bus, then persist the bus layout. | host:string, port:number, expectedProjectRoot:string, name*:string, fromName:string, index:integer, volumeDb:number, muted:boolean, send:string, save:boolean, layoutPath:string |
| `remove_audio_bus` | full | Remove a non-Master audio bus and persist the bus layout. | host:string, port:number, expectedProjectRoot:string, name*:string, save:boolean, layoutPath:string |
| `upsert_audio_bus_effect` | full | Add or update a curated AudioEffectReverb or AudioEffectLimiter on an audio bus. | host:string, port:number, expectedProjectRoot:string, busName*:string, effectKind*:enum(reverb\|limiter), effectIndex:integer, enabled:boolean, parameters:object, save:boolean, layoutPath:string |
| `create_audio_stream_player` | full | Create an AudioStreamPlayer with an AudioStreamGenerator stream and route it to a named bus. | host:string, port:number, expectedProjectRoot:string, parentPath:string, name:string, busName:string, volumeDb:number, autoplay:boolean, play:boolean, generator:object |
