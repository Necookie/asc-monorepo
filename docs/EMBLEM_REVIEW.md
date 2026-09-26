# ASC emblem correction

Reviewed 27 September 2026 against public/asc-logo-full.png and the reported screenshot.

The earlier model substituted a tubular two-node A and a coin for the original brand mark. The replacement traces the broad arch and shallow lower bridge, includes the smaller central node, and carries the cyan crown, violet left, and magenta right through vertex colors. Satin bevels and flattened round nodes provide depth. Colors remain consistent across light and dark themes.

The canonical vector geometry lives in apps/web/lib/asc-mark.ts. Both the 3D model and AscSymbol use it; the navigation mark, favicon, and mobile/still artwork now share the original three-node silhouette. The coin, halo, engraving, duplicate frame, and top accent stripe were removed from the showcase.

## Verification

- Full suite: 193 tests in 23 files pass.
- Workspace type checks and web production build pass. Lint command completes; scripts remain placeholders.
- Geometry: five meshes, 7,672 triangles, one shared material, no model texture downloads. Tests cover finite geometry/colors, a triangle budget, three-node connectivity, and one-time resource disposal.
- Browser: light and dark desktop, arrow keys, Home, reset, drag, narrow mobile still artwork, and opt-in mobile 3D checked on localhost:3001.
- Preserved: reduced-motion still rendering, context-loss fallback, deferred desktop loading, mobile opt-in, bounded pixel density, and rendering suspension when idle/offscreen. Those existing fallback triggers were reviewed in source rather than newly forced in the browser.
- React review: expensive scene setup remains in the effect; stable readiness/failure callbacks prevent scene recreation; Three.js loads dynamically; rotation state stays in refs, outside React render loops; SVG gradient IDs use useId to prevent collisions.

The original raster logo remains the source artwork. This is a procedural interpretation, not a pixel-exact 3D scan.
