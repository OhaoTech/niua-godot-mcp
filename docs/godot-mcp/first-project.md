# First project

Install is done ([README](../../README.md)). Just talk.

## 1. Check the connection

```text
Call get_godot_version.
```

You want a version like `4.6.x.stable`. If not: [troubleshooting](troubleshooting.md).

## 2. Build something

```text
Create a Godot project at ~/Godot/NIUAProjects/first-game.
Build a 3D scene with a ground plane, a cube, a camera, and a light.
Save it as res://main.tscn, set it as the main scene, run it,
and tell me if the game is playing.
```

You should see Godot open and a game window. That counts as success.

## 3. Optional: movement + self-check

```text
Add WASD movement to the cube with an input map and a small script.
Run the game, send movement input, verify the cube moved from runtime state.
```

## Tips

- Projects must stay under the folder you allowed at install (default `~/Godot/NIUAProjects`).
- Always **save** the scene before run — otherwise Godot can pop a dialog the AI can’t click.
- Install the forge skill from the README if the AI keeps forgetting that.
