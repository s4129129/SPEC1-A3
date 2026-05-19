# Spects

An interactive p5.js artwork with scrolling stages, generated popup shapes, plane movement, smoke particles, and layered sound.

## Folder Guide

- `Code/` - the playable artwork.
- `designed-sounds/` - finished sound effects used by the sketch.
- `raw-sound-sources/` - original sound files before editing.
- `design-documents/` - design process notes and supporting images.

## Code Guide

- `Code/index.html` loads p5.js, the custom font, CSS, and the sketch.
- `Code/style.css` keeps the browser page clean so the canvas fills the screen.
- `Code/sketch.js` contains the full artwork.

The main sketch is organized into labeled sections:

- settings
- running state
- p5 lifecycle
- input and window events
- performance mode
- UI layout and drawing
- sound helpers
- drawing helpers
- smoke helpers
- entity classes

## Controls

- Scroll to move through the stages.
- Click popup boxes to fire projectiles and play ring sounds.
- Press `U` to toggle Ultra Smooth mode for better performance.

