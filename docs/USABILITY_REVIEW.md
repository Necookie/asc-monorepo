# Usability review — 29 September 2026

This review focused on finding a member, editing a profile, and moving between dashboard and staff sections. Changes follow `DESIGN.md` and keep the existing ASC visual language.

## Principles used

- **Show where people are and let them recover.** Navigation shows its current section; directory filters show their selection and offer a reset. This follows [Nielsen Norman Group's visibility and user control heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and [WCAG's navigable guidance](https://www.w3.org/WAI/WCAG22/Understanding/navigable).
- **Make controls understandable.** Search has a visible label and submit action. Editor and staff fields have associated labels; selection controls expose their state. See [W3C labels or instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions).
- **Support keyboard and touch use.** A skip link reaches the single main landmark, focus has a visible outline, and small editor targets were enlarged. See [W3C bypass blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks) and [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- **Keep long tasks manageable.** Member results are paged 20 at a time, and the editor repeats Save Changes after the active section.

## What was checked

- Local browser on `/members`: a first page, a second page, a named search, and a 390px viewport; no horizontal overflow was observed.
- Directory privacy test: paging excludes a private profile before applying its offset.
- Repository gates: `pnpm test`, `pnpm typecheck`, `pnpm lint`, and web build passed. The current lint scripts print status messages; they do not yet run a static analyzer.

The staff and profile editor changes were checked through code review, types, and project tests. A signed-in browser pass with member and staff accounts remains part of the release accessibility review; this work does not claim WCAG conformance.

The public policy and terms pages still need accurate owner-approved content. Their dead footer links were removed until the pages exist.
