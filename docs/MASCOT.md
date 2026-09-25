# Interactive ASC mascot

The public-page companion uses the redrawn `cat-arcade.png`. SVG partitions articulate
its head, raised arm, and tail without downloading additional artwork or adding
animation dependencies. An eyelid overlay supplies blinking and closed-eye
expressions. Keep the partition coordinates aligned if the source art changes.

## Controls and behavior

- Tap/click the mascot to wave and toggle its actions. The panel offers Wave,
  Pet, Celebrate, Nap/Wake, and a persistent animation pause preference.
- Moving a mouse nearby lifts and turns its head. Stroking across it produces a purring
  expression, paw movement, tail swish, and heart. The Pet button provides the same action on touch devices
  and keyboards.
- Drag with mouse, pen, or touch. Pickup leans with the drag; landing has a squash and settle.
  Positions are normalized in local storage and clamped on resize. The sticky
  navigation is reserved so the mascot cannot be trapped behind it.
- Arrow keys move it 16px; Shift+Arrow moves it 40px. Enter/Space opens actions.
  Tab reaches each action. Escape closes the panel and returns focus to the mascot;
  outside pointer input closes it without interfering with the page.
- Breathing, tail movement, occasional head movement, and blinking animate idle
  behavior. After 30 seconds without a mascot interaction, it naps. Tap or Wake
  triggers a stretch. Celebration briefly tosses confetti. It never roams across the page on its own.

## Motion and lifecycle

Reduced motion is observed on load and when the system preference changes.
Actions still change the expression and descriptive status, with no decorative
motion. Pausing persists across reloads. A hidden tab stops animations, timers,
and pointer tracking. Returning restarts the current state's timer.

Pointer tracking schedules at most one update per animation frame, without
re-rendering React. Dragging uses Motion values for translation. Decorative
animation uses transforms and opacity. Event listeners, frames, and timers are
removed on unmount. The companion is absent from dashboard, admin, login, and
not-a-member routes.

Storage is optional: malformed positions fall back to the default corner, and
blocked storage does not prevent dragging or pausing for the current visit.

## Verification checklist

- At 375, 768, 1024, and 1280px, exercise every action and check the panel bounds.
- Drag to all four corners; verify the mascot stays reachable below navigation.
- Verify pointer capture, release without a click, cancellation, and a subsequent
  normal tap. Repeat using native touch input.
- Stroke to pet, use keyboard movement, reload, and resize to verify restoration.
- Pause and reload; enable reduced motion both before and after page load.
- Hide/restore the tab, verify idle sleep, and verify waking.
- Verify malformed/unavailable local storage, outside dismissal, focus return,
  protected-route exclusion, and readable controls in light/dark themes.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and a production build. The
  repository's current lint scripts are placeholders, not a full static analysis.
