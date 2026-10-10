# Day 10's Brightpath

Day 10 (Layers) is Brightpath, a bland 2026 company homepage that never deleted a redesign: every older version of the site is still stacked underneath it. Drag the page and it tilts into a 3D exploded stack, from 2026 down through 2014, 2008, 2001 and 1997 GeoCities to the bare `<html>`, where Dante is asleep. It's set in Inter, with Open Sans for 2014 and system fonts for the older eras.

- **The stack** is `ERAS` in the frontmatter: each layer's id, its depth (0 for the bare page, 5 for 2026) and its devtools-style tag. Every layer fills the screen and is opaque, so flat, only 2026 and the cookie banner show. The two floaters sit between eras: the sticky note at depth 4.5 and the cookie banner at 6.2.
  - **Flat, it's a normal page.** Below a spread of 0.01, `.is-flat` drops the 3D entirely, so clicks and stacking work like any page.
  - **Exploded,** each layer moves out by its depth minus `--middle` (3), times the spread, times `--gap` (170px), so the stack turns around its middle. The whole stack shrinks to 50% at full spread to stay on screen. Each layer's outline and tag fade in with the spread; hovering a layer brightens its outline.
- **Tilting:** drag anywhere. It turns 0.25° per pixel (`DEGREES_PER_PIXEL`), up to 70° either way on either axis (`MOST_TILT`). The spread follows the tilt and is full at 40° (`FULL_SPREAD_AT`). A press that moves under 6px (`DRAG_THRESHOLD`) is still a click, and the click at the end of a drag is swallowed. The page never scrolls (`touch-action: none`), so dragging works the same on phones.
  - **Manage layers** on the cookie banner and **See how it's built →** on the 2026 page ease to a view from below (−44°, 26°: `PRESET_TILT_X`, `PRESET_TILT_Y`) over 900ms (`TWEEN_MS`). From below, each older era's header peeks out above the next one. Looking down from above shows their bottoms instead, which is where Dante is.
  - **Flatten,** a double-click or Escape eases it back.
  - **The layers slider** at the bottom left walks the same path as the preset, for keyboards and anyone who'd rather not drag.
  - With reduced motion, the tilt jumps instead of easing, and the marquee, the blinking NEW! and Dante's z's stop.
- **The eras:**
  - **2026:** Inter, soft gradient blobs, "The platform for whatever comes next."
  - **2014:** Open Sans, a flat teal jumbotron, "We Make Business Simple.", three round icons.
  - **2008:** a glossy blue header with a reflected "BrightPath 2.0" and an orange BETA starburst, a green pill button, a tag cloud.
  - **2001:** Verdana in a gray table layout, a navy gradient banner, a `[spacer.gif]`, "Best viewed in Internet Explorer 5.5 at 800×600".
  - **1997:** Comic Sans on a starfield, a marquee, an under-construction stripe, a rainbow rule, a hit counter.
  - **The bare page:** a transparency checkerboard, "nothing here but dust", and Dante.
- **The links on the old sites are spans** styled to look like links, since they go nowhere. Biome rejects both `href="#"` and placeholder anchors.
- **The cookie banner:** "Accept all" sends it floating up and away. On screens 640px wide or less it sits 3.25rem up so it clears the slider.
- **The sticky note** ("TODO: delete old sites before launch!!") hangs off the top-left corner of the 2014 layer, the part the newer sites don't cover in the preset view. Flat, it's above the top of the screen and under 2026.
- **Sound** is synthesized with Web Audio, with no files. The five layers above the bare page each count as coming apart at a spread of 0.1, 0.3, 0.5, 0.7 and 0.9 (`SEPARATING_LAYERS`).
  - **Coming apart,** a layer plays a peel: bandpassed noise at 900Hz × 1.25 per layer, plus a sine at 220Hz × 1.19 per layer, so pulling the whole stack apart climbs a little scale.
  - **Settling back,** it plays a duller tap: lowpassed noise at 500Hz × 1.15 per layer and a sine at 140Hz × 1.12 per layer.
  - Several layers crossing at once (the slider, a fast drag) play 45ms apart (`SOUND_STAGGER`). Volume is 0.35 (`VOLUME`). There's no mute.
- **The hidden cat** is Dante, `HiddenCat`'s silhouette at 78px in tabby brown (`#6b4a2f`), in the bottom-right corner of the bare page with a drifting "z z z". Flat, every layer covers him. He shows once the stack is dragged to look down from above, and clicking him works through the 3D.
- **Fonts:** the older eras use system fonts (Comic Sans MS, Times New Roman, Verdana, Arial, Lucida Grande, Trebuchet MS, Marker Felt for the sticky note), which is the point, but phones without them fall back: Android has none of them, and iOS has no Comic Sans.
- **Phones:** a portrait screen fans the eras taller than desktop does, so more of each one shows.
