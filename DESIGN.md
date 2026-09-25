# ASC Design System

## Overview

ASC is a community-first digital identity platform built around expressive member profiles, discovery, personalization, and community presence.

The visual system should feel energetic, social, playful, and unmistakably ASC.

Pages live on a monochrome canvas: warm white in light mode and near-black in dark mode. The canvas is intentionally calm so member avatars, names, roles, and profile expression remain the visual focus. Public-facing surfaces may introduce one authored atmospheric device at a time, such as a restrained pattern, a profile artwork treatment, or a single color field.

The overall experience should feel like a digital home for a community rather than a corporate SaaS dashboard.

ASC combines two visual modes:

1. **Expressive Community Mode** — used for the homepage, public member profiles, community discovery, achievements, special events, and promotional surfaces.
2. **Functional Application Mode** — used for profile editing, settings, administration, moderation, forms, tables, and other information-dense interfaces.

The expressive layer may be playful, but it must still feel authored and people-first.

The application layer must remain clear and usable while still visibly belonging to ASC.

### Arcade expression

ASC's public voice is a playful community arcade, drawn with confident ink, punchy labels, member portraits, and a few carefully placed magenta, cyan, and green signals. The arcade cue comes from composition and interaction rather than pixel fonts, noisy wallpaper, or constant motion. The gray-and-white cat in glasses and a navy jacket is the recognizable companion; its reactions are expressive but never block reading or navigation.

The homepage may host one interactive 3D ASC-mark scene. Directory cards, profiles, and the appearance preview may use lighter perspective and layered depth. Application controls remain flat, familiar, and readable. Keep real member identity and content in HTML rather than inside a canvas. Reduced motion and unsupported graphics fall back to a still composition.

### Core Characteristics

* Monochrome canvas (`{colors.canvas}`) with solid, legible surfaces.
* White light mode and black dark mode are the main visual states, switched from the primary navigation.
* Ink primary actions invert against the active canvas for reliable contrast.
* Electric green (`{colors.green}`) is reserved for exceptional high-intent or positive actions.
* Vibrant magenta (`{colors.magenta}`) provides the playful counterweight to violet.
* Large, confident display typography.
* Soft, generous geometry.
* 12–16px rounding for everyday controls.
* 24–40px+ rounding for cards, media, and expressive sections.
* Pill shapes for roles, tags, status indicators, and badges.
* Profile imagery and member identity should be visually dominant.
* Depth should primarily come from surface contrast, spacing, scale, and deliberate overlap.
* Public profiles should feel personal and expressive.
* Dashboard surfaces should feel calmer and more structured.
* Mobile behavior is a first-class requirement.
* Accessibility and readability take priority over decorative effects.
* Body copy stays at least 16px, and secondary labels at least 14px where space allows.
* Keep prose to roughly 65–75 characters per line and readable on custom covers.

### Visual Restraint Rules

ASC avoids the visual patterns that make community products feel generic or machine-generated.

* Member identity is the primary imagery. Use real, consented community avatars and profiles whenever possible.
* Do not place a photographic or illustrated background behind the entire application shell.
* Standard cards, forms, dashboard panels, and admin panels use opaque surfaces. They do not use backdrop blur.
* A page or section may use one decorative device: artwork, pattern, gradient, or glow. Never stack all four.
* Gradients are reserved for the ASC mark and rare campaign artwork. Do not use gradient text, gradient badges, or gradient card fills.
* Shadows communicate actual elevation. Static content and standard cards remain flat.
* Avoid repeated equal-sized feature-card grids. Prefer narrative layouts, member walls, timelines, or grouped content.
* Public pages may use expressive composition, but application pages must remain quiet and task-focused.
* Decorative motion never competes with reading and never moves persistently across the viewport.

---

# Colors

## Brand & Accent

### Primary Ink

`{colors.primary}` — `#111111` in light mode, `#f7f7f7` in dark mode

The primary ASC interaction color. It inverts with the active color mode so primary actions remain legible without relying on blue.

Use for:

* Primary buttons
* Active navigation states
* Selected controls
* Links requiring emphasis
* Theme toggle states
* Important actions
* Active navigation states
* Selected tabs
* Focus states
* Strong text links

Blue remains available for synchronized role colors and legacy profile accent data, but it is no longer a global surface or interaction color.

This is the most frequently used action color.

---

### Electric Green

`{colors.green}` — `#35ed7e`

Reserved for high-intent, success, or exceptional actions.

Examples:

* Join ASC
* Save successfully
* Active/online state where appropriate
* Confirmed state
* Exceptional primary conversion CTA

Pair primarily with dark text.

Do not use green as a general decorative accent.

---

### ASC Magenta

`{colors.magenta}` — `#ec48bd`

The expressive counterweight to ASC Violet.

Use for:

* Gradient feature panels
* Special badges
* Achievement surfaces
* Booster/supporter surfaces
* Decorative atmospheric effects
* Event cards
* Featured member surfaces
* Profile customization previews

Magenta should feel special rather than universal.

---

### Link Cyan

`{colors.link}` — `#00b0f4`

Use sparingly for recognizable inline links on dark surfaces where violet does not provide enough visual separation.

---

## Surfaces

### ASC Canvas

`{colors.canvas}` — `#fafafa` in light mode, `#111111` in dark mode

Primary application and website background. The light mode is white-tinted rather than pure white, and the dark mode is black-tinted rather than pure black, preserving comfortable contrast.

This is ASC's visual foundation.

Never replace the entire ASC experience with generic neutral gray.

---

### Raised Indigo

`{colors.surface-indigo}` — `#1e2353`

Primary elevated surface.

Use for:

* Dashboard cards
* Profile widgets
* Forms
* Member cards
* Settings panels
* Tables
* Search surfaces
* Modals
* Navigation surfaces
* Empty states

---

### Onyx

`{colors.surface-onyx}` — `#23272a`

Use for:

* Dense UI surfaces
* Embedded identity cards
* Secondary navigation
* Dividers
* Dark preview surfaces
* Profile information modules

---

### Black

`{colors.surface-black}` — `#000000`

Use selectively for dramatic showcase sections, profile preview stages, event presentations, or media-focused sections.

Do not make pure black the default page background.

---

### Surface Hover

`{colors.surface-hover}` — `#292f68`

Used when an interactive Raised Indigo surface is hovered.

---

### Surface Active

`{colors.surface-active}` — `#343b7a`

Used for active or selected interactive surfaces.

---

## Text

### Primary Ink

`{colors.ink}` — `#111111` in light mode, `#f7f7f7` in dark mode

Primary text on the active canvas.

---

### Dark Ink

`{colors.ink-dark}` — `#f7f7f7` in light mode, `#111111` in dark mode

Text used on:

* Green buttons
* White buttons
* Light badges
* Light surfaces

---

### Secondary Ink

`{colors.ink-secondary}` — `#c7c9e5`

Secondary body text on dark surfaces.

Use for descriptions, metadata, timestamps, and supporting information.

---

### Muted Ink

`{colors.muted}` — `#9498bd`

Use for low-priority metadata.

Examples:

* Secondary timestamps
* Optional labels
* Disabled metadata
* Helper text

Never use muted text for critical information.

---

## Semantic Colors

### Success

`{colors.success}` — `#35ed7e`

### Warning

`{colors.warning}` — `#f0b232`

### Danger

`{colors.danger}` — `#ed4245`

### Information

`{colors.info}` — `#00b0f4`

Semantic colors should communicate state first and decoration second.

---

# Brand Gradient

ASC's legacy atmospheric gradient moves between:

`{colors.primary}` → deep violet → `{colors.magenta}` → `{colors.canvas}`

The gradient is not a default page treatment. It is reserved for the ASC mark, special event artwork, and rare campaign imagery. Standard UI surfaces remain solid.

When a gradient is specifically warranted:

* Radial gradients
* Use one gradient layer only.
* Keep it away from body copy and form controls.
* Do not combine it with glass cards, mesh patterns, or atmospheric glows.

Example conceptual implementation:

```css
background:
  radial-gradient(circle at 20% 20%, rgba(88,101,242,.45), transparent 40%),
  radial-gradient(circle at 80% 30%, rgba(236,72,189,.30), transparent 40%),
  #0a0d3a;
```

Motion must remain subtle.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Disable nonessential animated gradients and decorative motion when reduced motion is requested.

---

# Typography

## Font Families

ASC should use open-source typography.

### Display

Preferred:

**Hanken Grotesk**

Fallback:

**Space Grotesk**

Weights:

* 700
* 800
* 900 where supported

Use for:

* Hero headings
* Major section titles
* Community statistics
* Event titles
* Large profile titles
* Promotional surfaces
* Major empty-state headings

---

### Body / UI

Preferred:

**Inter**

Alternative:

**Plus Jakarta Sans**

Weights:

* 400
* 500
* 600
* 700

Use for:

* Body copy
* Forms
* Navigation
* Dashboard
* Member metadata
* Buttons
* Tables
* Settings
* Administration

---

# Typography Hierarchy

| Token                     | Size | Weight | Line Height | Use                |
| ------------------------- | ---: | -----: | ----------: | ------------------ |
| `{typography.display-xl}` | 82px |    800 |         1.0 | Desktop hero       |
| `{typography.display-lg}` | 62px |    800 |        1.05 | Major banner       |
| `{typography.display-md}` | 56px |    700 |        1.05 | Section headline   |
| `{typography.heading-xl}` | 48px |    700 |         1.1 | Major subsection   |
| `{typography.heading-lg}` | 36px |    700 |        1.15 | Page heading       |
| `{typography.heading-md}` | 28px |    700 |         1.2 | Card group heading |
| `{typography.heading-sm}` | 22px |    700 |         1.2 | Card heading       |
| `{typography.body-lg}`    | 20px |    500 |         1.4 | Lead paragraph     |
| `{typography.link-lg}`    | 18px |    600 |         1.4 | Large button       |
| `{typography.body}`       | 16px |    400 |         1.5 | Default copy       |
| `{typography.link}`       | 16px |    600 |         1.4 | Navigation/button  |
| `{typography.body-sm}`    | 14px |    400 |         1.5 | Metadata           |
| `{typography.link-sm}`    | 14px |    600 |         1.4 | Tag/badge/button   |
| `{typography.caption}`    | 12px |    500 |         1.4 | Fine metadata      |

---

# Typography Principles

Public marketing and community surfaces may use short, declarative, occasionally ALL-CAPS headlines.

Examples:

**YOUR COMMUNITY. YOUR PROFILE.**

**MEET ASC.**

**MAKE IT YOURS.**

**THE COMMUNITY, BEYOND THE CHAT.**

Do not use all-caps for long paragraphs, forms, settings, tables, or profile biographies.

The contrast between display and body typography should remain obvious.

Display:

```text
700–800
```

Body:

```text
400–500
```

Application UI:

```text
500–600
```

---

# Layout

## Spacing System

Base unit:

**8px**

Tokens:

| Token                  | Value |
| ---------------------- | ----: |
| `{spacing.xxs}`        |   4px |
| `{spacing.xs}`         |   8px |
| `{spacing.sm}`         |  12px |
| `{spacing.md}`         |  16px |
| `{spacing.lg}`         |  20px |
| `{spacing.xl}`         |  24px |
| `{spacing.xxl}`        |  32px |
| `{spacing.section}`    |  40px |
| `{spacing.section-lg}` |  64px |
| `{spacing.section-xl}` |  96px |

---

# Container

Primary content container:

```text
max-width: 1200–1280px
margin: auto
```

Public profile pages may expand beyond this where a profile background or decorative layer needs full viewport coverage.

Dashboard pages should generally stay around:

```text
1200–1440px
```

depending on sidebar usage.

---

# Page Rhythm

Public-facing pages should generally follow:

```text
Atmospheric Hero
        ↓
Community Content
        ↓
Profile / Member Showcase
        ↓
Feature Surfaces
        ↓
Community Statistics
        ↓
CTA
        ↓
Footer
```

Dashboard pages instead follow:

```text
Navigation
    ↓
Page Heading
    ↓
Controls / Tabs
    ↓
Structured Content
```

Do not force marketing-page spacing into administrative interfaces.

---

# Responsive Strategy

## Breakpoints

| Name    |         Width | Behavior      |
| ------- | ------------: | ------------- |
| Mobile  |      `<768px` | Single column |
| Tablet  |  `768–1023px` | Hybrid layout |
| Laptop  | `1024–1279px` | Multi-column  |
| Desktop |     `≥1280px` | Full layout   |

---

# Mobile

Mobile is mandatory.

At `<768px`:

* Navigation collapses.
* Profile columns stack.
* Dashboard sidebar becomes drawer or compact navigation.
* Buttons maintain ≥44px touch height.
* Profile cards use full available width.
* Member grids become one or two columns depending on width.
* Decorative art must not obscure content.
* Oversized headings scale using `clamp()`.
* Forms become full-width.
* Tables may become cards or horizontally scroll.
* Profile editing preview may move below controls.

Never require desktop width for core functionality.

---

# Elevation & Depth

ASC relies primarily on:

* Surface color
* Border contrast
* Scale
* Overlapping elements
* Whitespace

rather than aggressive shadows.

## Elevation Levels

### Level 0 — Flat

No shadow.

Use for:

* Standard cards
* Tags
* Role chips
* Static content

---

### Level 1 — Raised

```css
box-shadow: 0 8px 30px rgba(0,0,0,.12);
```

Use for:

* Dropdowns
* Floating cards
* Profile widgets
* Navigation popovers

---

### Level 2 — Floating

```css
box-shadow: 0 18px 60px rgba(0,0,0,.22);
```

Use for:

* Modal
* Command palette
* Floating profile preview
* Important overlays

---

### Atmospheric Glow

Decorative only:

```css
box-shadow: 0 3px 68px rgba(88,101,242,.14);
```

Use only for temporary or promotional artwork. Never apply it to ordinary cards, buttons, profile rows, dashboard panels, or admin UI.

---

# Shapes

## Border Radius

| Token             |  Value | Use                 |
| ----------------- | -----: | ------------------- |
| `{rounded.xs}`    |    6px | Compact controls    |
| `{rounded.sm}`    |   12px | Buttons / inputs    |
| `{rounded.md}`    |   14px | Rows                |
| `{rounded.lg}`    |   16px | Cards               |
| `{rounded.xl}`    |   24px | Major cards         |
| `{rounded.2xl}`   |   40px | Feature panels      |
| `{rounded.pill}`  |   50px | Tags / roles        |
| `{rounded.jumbo}` |  120px | Expressive sections |
| `{rounded.full}`  | 9999px | Avatar / circles    |

Public-facing surfaces may use larger radii than application surfaces.

---

# Avatars

Avatars are central to ASC's visual language.

Standard sizes:

```text
24px  compact
32px  navigation
40px  comments/list
48px  member rows
64px  member cards
96px  profile
128px profile hero
```

Avatars are always circular unless a future ASC cosmetic explicitly changes their presentation.

Use:

```text
rounded-full
```

---

# Components

# Buttons

## `button-primary`

Main ASC action.

```text
background: {colors.primary}
text: white
radius: {rounded.sm}
font: {typography.link}
```

Use for:

* Save
* Customize Profile
* View Profile
* Continue
* Create
* Confirm normal actions

---

## `button-green`

Highest-intent action.

```text
background: {colors.green}
text: {colors.ink-dark}
```

Use sparingly.

Examples:

* Join ASC
* Complete setup

Do not use multiple green CTAs on the same surface.

---

## `button-white`

```text
background: white
text: black
radius: {rounded.lg}
```

Useful inside strongly colored CTA bands.

---

## `button-ghost`

```text
background: {colors.surface-indigo}
text: white
```

Used for secondary actions.

---

## `button-danger`

```text
background: {colors.danger}
text: white
```

Only for destructive actions.

Examples:

* Reset profile
* Hide member
* Delete tag
* Revoke customization

Require confirmation for consequential actions.

---

# Navigation

## `nav-bar`

Primary ASC navigation.

Desktop structure:

```text
ASC

Home
Members
Explore

                         Search
                         My Profile
                         User Avatar
```

Logged-out users may instead see:

```text
ASC

Home
Members
Explore

                         Sign In
```

Navigation background may be transparent over the homepage hero and transition into an indigo/blurred surface after scrolling.

Application/dashboard navigation should remain stable.

---

# Footer

Dark ASC footer.

Suggested structure:

```text
ASC

Community
Members
Explore

Account
My Profile
Settings

Information
Privacy
Terms

                    ASC
```

A large decorative **ASC** wordmark may appear near the bottom.

---

# Hero

## `hero`

Homepage hero.

Uses:

* ASC canvas
* Atmospheric violet/magenta mesh
* Oversized display typography
* Community avatars
* Member/profile visual elements
* Primary CTA
* Secondary CTA

Example:

```text
YOUR COMMUNITY.
YOUR PROFILE.

ASC gives every member a place to express who they are,
discover others, and be part of the community beyond the chat.

[ Explore Members ] [ My Profile ]
```

Hero decoration should use ASC member/profile concepts rather than generic stock illustrations.

---

# Member Card

## `member-card`

Used in `/members`, homepage, search, and discovery.

Structure:

```text
┌────────────────────────────┐
│                            │
│        [ Avatar ]          │
│                            │
│         Dheyn              │
│       @necookie            │
│                            │
│ [Developer] [AI] [Linux]   │
│                            │
│       ◆ Supporter          │
│                            │
└────────────────────────────┘
```

Properties:

```text
background: {colors.surface-indigo}
rounded: {rounded.xl}
padding: {spacing.xl}
```

Hover:

* Slight translate upward
* Slightly brighter surface
* Subtle violet glow

Respect reduced-motion settings.

---

# ASC Identity Card

## `asc-identity-card`

The primary synchronized community identity surface shown on public profiles.

This card represents authoritative ASC membership information synchronized from the community platform.

It is visually distinct from user-editable profile content.

May contain:

```text
Banner / accent
Avatar
Display name
Username
Server nickname
ASC roles
Supporter status
Membership date
Relevant synchronized badges
```

Example:

```text
┌────────────────────────────────┐
│        IDENTITY BANNER         │
│                                │
│          [ Avatar ]            │
│                                │
│ Dheyn                          │
│ @necookie                      │
│                                │
│ Administrator                  │
│ Developer                      │
│ ◆ Supporter                    │
│                                │
│ Member since Sep 2025          │
│                                │
│        Synced with ASC         │
└────────────────────────────────┘
```

The user cannot manually edit synchronized identity fields.

Use an indicator:

**Synced with ASC**

Never expose internal IDs.

---

# Public Profile

## `profile-page`

Public member profile:

```text
/[username]
```

The page should support an expressive custom background while keeping content readable.

Desktop concept:

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│               CUSTOM BACKGROUND                      │
│                                                      │
│  ┌───────────────────────┐ ┌──────────────────────┐  │
│  │                       │ │       ABOUT          │  │
│  │   ASC IDENTITY CARD   │ │                      │  │
│  │                       │ │ ASC profile bio      │  │
│  │                       │ │                      │  │
│  └───────────────────────┘ └──────────────────────┘  │
│                                                      │
│  ┌───────────────────────┐ ┌──────────────────────┐  │
│  │        TAGS           │ │       LINKS          │  │
│  └───────────────────────┘ └──────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Custom backgrounds must never reduce text readability below accessible contrast levels.

Apply overlays when necessary.

---

# Profile Widget

## `profile-widget`

Reusable public profile content container.

```text
background:
  rgba(30,35,83,.88)

backdrop-filter:
  blur(12px)

rounded:
  {rounded.xl}

padding:
  {spacing.xl}
```

Examples:

* About
* Tags
* Links
* Achievements
* Stats
* Projects
* Activity
* Membership History

V1 may only implement a subset.

---

# Profile Tags

## `tag-chip`

User-selected ASC interests.

Examples:

```text
Developer
Artist
Gamer
AI
Linux
Music
Student
Photography
```

Appearance:

```text
background: rgba(88,101,242,.18)
border: rgba(88,101,242,.35)
text: white
rounded: pill
```

Tags are not authoritative roles.

---

# Role Chip

## `role-chip`

Represents synchronized ASC community roles.

Roles and tags must look visually distinct.

Role:

```text
● Administrator
● Developer
```

Tag:

```text
AI
Linux
Student
```

Role chips may inherit role-specific colors where available and readable.

---

# Supporter Badge

## `supporter-badge`

Special membership/support status.

Use a violet-magenta treatment rather than generic green.

Example:

```text
◆ SUPPORTER
```

or:

```text
✦ SUPPORTER
```

The badge should feel premium without overpowering identity information.

---

# Achievement Badge

## `achievement-badge`

Future-compatible component.

Contains:

```text
Icon
Achievement name
Description
Unlock date
Rarity
```

Possible tiers:

```text
Common
Rare
Epic
Legendary
Event
```

Do not rely on color alone to communicate tier.

---

# Community Stat Card

## `community-stat-card`

Used on homepage and future statistics surfaces.

Example:

```text
┌───────────────────────┐
│                       │
│         1,284         │
│                       │
│        MEMBERS        │
│                       │
└───────────────────────┘
```

Primary cards may use `{colors.primary}`.

Secondary statistics use raised-indigo surfaces.

---

# Profile Stat Card

## `profile-stat-card`

Reserved for future profile statistics.

Possible metrics:

```text
Messages
Voice Time
Level
Achievements
Events
Support Duration
```

Statistics should not dominate V1 profiles.

---

# Member Directory

## `member-directory`

Primary `/members` experience.

Structure:

```text
ASC MEMBERS

[ Search members........................ ]

[ All ] [ Staff ] [ Supporters ] [ Developer ]

┌─────────────────────────┐ ┌────────────┐
│   Featured member       │ │   Member   │
└─────────────────────────┘ └────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐
│   Member   │ │   Member   │ │   Member   │
└────────────┘ └────────────┘ └────────────┘
```

Desktop:

Three or four columns, with the first member occupying two columns. Keep source order and reading order identical.

Tablet:

2–3 columns.

Mobile:

1–2 columns depending on available width.

---

# Search Input

## `search-input`

```text
background: {colors.surface-indigo}
border: transparent
text: white
placeholder: {colors.muted}
radius: {rounded.lg}
height: >= 44px
```

Focused:

```text
border: {colors.primary}
outline/glow: subtle primary
```

Example placeholder:

```text
Search members, usernames, or tags...
```

---

# Inputs

## `text-input`

```text
background: {colors.surface-indigo}
text: white
border: transparent
radius: {rounded.sm}
```

Focused:

```text
border: {colors.primary}
```

Invalid:

```text
border: {colors.danger}
```

Labels always remain visible.

Do not rely exclusively on placeholders.

---

# Textarea

## `textarea`

Used for ASC profile biographies and admin descriptions.

Minimum:

```text
min-height: 120px
```

Show character limits where applicable.

---

# URL Input

## `url-input`

Used for:

* Profile links
* External background
* Future project links

Display validation state.

Never render arbitrary user input as executable HTML.

---

# Dashboard

## `dashboard-shell`

Desktop:

```text
┌──────────────┬──────────────────────────────────┐
│              │                                  │
│ ASC          │ PAGE                             │
│              │                                  │
│ Profile      │                                  │
│ Appearance   │                                  │
│ Tags         │                                  │
│ Links        │                                  │
│ Privacy      │                                  │
│              │                                  │
│──────────────│                                  │
│ My Profile   │                                  │
│ Sign Out     │                                  │
└──────────────┴──────────────────────────────────┘
```

Dashboard surfaces should be quieter than public profiles.

Do not put giant animated gradients behind every settings panel.

---

# Profile Editor

## `profile-editor`

Desktop:

```text
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│ EDITOR               │ LIVE PREVIEW             │
│                      │                          │
│ Bio                  │                          │
│ Tags                 │     Profile              │
│ Links                │     Preview              │
│ Theme                │                          │
│ Background           │                          │
│                      │                          │
│ [ Save Changes ]     │                          │
└──────────────────────┴──────────────────────────┘
```

Changes should preview client-side.

Persistence happens after explicit Save.

Do not write to the database on every slider movement or keystroke unless autosave is intentionally implemented later.

---

# Appearance Editor

## `appearance-panel`

Controls may include:

```text
Theme
Accent
Background URL
Transparency
Profile title
```

Locked features should clearly communicate their entitlement.

Example:

```text
Animated Background

◆ Supporter Feature

[ Locked ]
```

Do not hide locked features completely if showing them helps communicate available customization.

---

# Live Preview

## `profile-preview`

The preview should render the same profile components used by the real public profile whenever practical.

Avoid maintaining a completely separate fake preview implementation.

Desktop preview may be sticky.

Mobile preview appears below editor controls.

---

# Privacy Settings

## `privacy-control`

Use clear toggle rows.

Example:

```text
Public Profile

Allow other ASC members to view your profile.

                         [ ON ]
```

Possible settings:

```text
Public profile
Show roles
Show membership date
Show tags
Show external links
```

Explain the effect of privacy controls in plain language.

---

# Admin

## `admin-shell`

Administrative interfaces prioritize function over decorative expression.

Use:

* Indigo canvas
* Raised panels
* Tables
* Search
* Filters
* Modals
* Clear status indicators

Avoid excessive animated gradients.

---

# Admin Member Table

## `member-table`

Columns may include:

```text
Member
Username
Status
Roles
Supporter
Profile
Last Synced
Actions
```

Desktop uses table layout.

Mobile may convert rows into cards.

---

# Status Badge

## `status-badge`

Examples:

```text
ACTIVE
LEFT
BANNED
HIDDEN
```

Status must include text.

Never communicate state through color alone.

---

# Modal

## `modal-card`

```text
background: {colors.surface-indigo}
rounded: {rounded.xl}
padding: {spacing.xxl}
shadow: Level 2
```

Backdrop:

```text
rgba(0,0,0,.60)
```

Use for:

* Confirmation
* Profile reset
* Moderation
* Destructive actions
* Important editing workflows

---

# Toast

## `toast`

```text
background: {colors.surface-indigo}
rounded: {rounded.lg}
padding: {spacing.md}
```

Variants:

```text
Success
Error
Warning
Information
```

Examples:

```text
Profile saved.

Background URL is invalid.

Member profile hidden.
```

---

# Empty State

## `empty-state-card`

Use when content doesn't exist.

Example:

```text
        ✦

NO LINKS YET

This member hasn't added any links.

[ Add Link ]
```

Empty states should feel intentional rather than broken.

---

# Loading

## Skeleton

Use skeleton surfaces matching the final component geometry.

Do not use a giant global spinner for every operation.

Profile loading should skeleton:

```text
Avatar
Display name
Identity metadata
Profile widgets
```

---

# Error State

Friendly and concise.

Example:

```text
WE COULDN'T LOAD THIS PROFILE.

Something went wrong while loading this member.

[ Try Again ]
```

Do not expose stack traces, database errors, tokens, internal identifiers, or infrastructure information.

---

# Profile Not Found

Example:

```text
THIS PROFILE DOESN'T EXIST.

The member may have changed their username or is no longer available.

[ Explore Members ]
```

Historical aliases should redirect when applicable rather than showing this page.

---

# CTA Band

## `cta-band`

Full-width expressive section.

```text
background:
ASC Violet / violet-magenta gradient

rounded:
{rounded.2xl}

padding:
{spacing.section-lg}
```

Example:

```text
FIND YOUR PEOPLE.

Explore the ASC community and discover who's here.

[ Explore Members ]
```

---

# Marquee Band

## `marquee-band`

Optional decorative component.

Example:

```text
CREATE · CONNECT · BELONG · ASC ·
CREATE · CONNECT · BELONG · ASC ·
```

Use only on expressive public pages.

Never place animated marquees in settings or admin interfaces.

Respect reduced-motion preferences.

---

# Profile Backgrounds

Custom profile backgrounds may come from externally hosted URLs.

Rules:

* Must not interfere with content readability.
* Add dark overlays automatically when required.
* Content cards should use translucent indigo surfaces.
* Never execute external content.
* Background failure should gracefully fall back to ASC canvas.
* Do not resize the entire layout based on image dimensions.
* Background uses `cover` behavior where appropriate.

Default:

```text
ASC atmospheric gradient
```

---

# Motion

ASC can use playful motion, but motion must communicate polish rather than chaos.

## Standard Interaction

Duration:

```text
150–250ms
```

Easing:

```text
ease-out
```

Examples:

* Button hover
* Card hover
* Dropdown opening
* Tab changes

---

## Expressive Motion

Duration:

```text
400–800ms
```

Examples:

* Profile entrance
* Hero decorative movement
* Achievement reveal
* Special supporter effect

Use sparingly.

---

# Hover Behavior

Interactive cards:

```text
translateY(-2px)
```

Optional subtle scale:

```text
scale(1.01)
```

Do not make the interface bounce aggressively.

Buttons may slightly brighten.

Links should have clear hover/focus treatment.

---

# Reduced Motion

When:

```css
prefers-reduced-motion: reduce
```

Disable or substantially reduce:

* Gradient animation
* Parallax
* Floating decoration
* Marquee motion
* Particle effects
* Entrance animation
* Large transforms

Core functionality must never depend on animation.

---

# Accessibility

Minimum expectations:

* WCAG AA contrast where applicable.
* Keyboard-accessible navigation.
* Visible focus indicators.
* Semantic HTML.
* Proper labels.
* Proper heading hierarchy.
* Alt text where images communicate information.
* Decorative images use empty alt.
* Buttons are actual buttons.
* Links are actual links.
* Modals trap focus.
* Escape closes dismissible overlays.
* Touch targets ≥44px where practical.
* Color is never the sole state indicator.
* Reduced-motion preference respected.

---

# Focus State

Primary focus ring:

```css
outline: 2px solid #5865f2;
outline-offset: 2px;
```

On violet surfaces, use a white or cyan ring when necessary for contrast.

Never remove focus indicators without replacing them.

---

# Profile Customization Safety

User customization must never permit arbitrary:

```text
HTML
JavaScript
CSS
iframes
scripts
```

Users configure predefined properties.

Example:

```json
{
  "theme": "midnight",
  "accent": "#5865f2",
  "backgroundUrl": "https://...",
  "cardOpacity": 0.88
}
```

ASC controls the renderer.

---

# Application States

Every important component should consider:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Empty
Locked
```

Do not implement only the ideal state.

---

# Entitlement UI

Features may be:

```text
AVAILABLE
LOCKED
EARNED
ROLE-BASED
SUPPORTER
EVENT
```

Locked features should explain why.

Example:

```text
Custom Background

◆ Supporter Feature

Support ASC to unlock custom profile backgrounds.
```

Never fake an entitlement client-side.

The server determines actual access.

---

# Future Widget System

ASC's design system should be compatible with future draggable profile widgets.

Potential widgets:

```text
Identity
About
Tags
Links
Achievements
Stats
Projects
Activity
Membership History
Favorite Games
Quote
External Image
```

Widgets share:

```text
{rounded.xl}
{colors.surface-indigo}
{spacing.xl}
```

Do not hardcode public profile layout so tightly that widgets become impossible later.

---

# Future Achievement System

Achievement surfaces may become more expressive than standard application cards.

Possible visual hierarchy:

```text
Common
Rare
Epic
Legendary
Seasonal
Event
```

Use combinations of:

* Border
* Icon
* Shape
* Label
* Gradient

rather than color alone.

---

# Future Statistics

Charts should inherit ASC colors.

Primary series:

```text
ASC Violet
```

Secondary:

```text
Magenta
Cyan
Green
```

Chart backgrounds remain dark.

Grid lines should be subtle.

Tooltips use raised-indigo surfaces.

Do not create rainbow dashboards.

---

# Content Voice

ASC copy should feel:

* Community-first
* Friendly
* Confident
* Playful
* Short
* Human

Avoid corporate phrases like:

```text
Leverage community synergies
Optimize user engagement
Empower digital transformation
```

Prefer:

```text
Make your profile yours.

Meet the community.

See who's here.

Welcome to ASC.

Your profile is ready.

Show off a little.
```

Admin/security messages may be more direct and functional.

---

# Page-Specific Guidance

## `/`

The homepage is the most expressive ASC page.

Allowed:

* Large gradient mesh
* Huge typography
* Floating avatars
* Community member cards
* Decorative profile previews
* Marquee
* Large CTA bands

---

## `/members`

Balance personality with usability.

Prioritize:

```text
Search
Filtering
Avatar
Display name
Username
Tags
Roles
Support status
```

Do not let decoration interfere with browsing.

---

## `/[username]`

Most personalized page.

Allow:

* Custom background
* Custom accent
* Profile title
* Custom theme
* Supporter effects

But synchronized identity must remain recognizable and trustworthy.

---

## `/dashboard`

Calmer.

Prioritize:

```text
Editing
Preview
Saving
Validation
Entitlements
Privacy
```

---

## `/admin`

Most functional surface.

Prioritize:

```text
Information density
Search
Filters
Moderation
Auditability
Safety
```

Decorative motion should be minimal.

---

# Visual Hierarchy

On a public profile, visual priority should generally be:

```text
1. Member identity
2. Display name
3. Avatar
4. ASC profile expression
5. Roles / title
6. Bio
7. Tags
8. Links
9. Secondary metadata
10. Future statistics
```

Do not let statistics overpower the human identity.

---

# Do's

* Lead with the active monochrome canvas.
* Use magenta atmosphere sparingly on expressive surfaces.
* Keep primary actions monochrome and mode-aware.
* Reserve electric green for exceptional high-intent/success actions.
* Use strong display typography on expressive public surfaces.
* Use Inter/Plus Jakarta Sans for functional application UI.
* Round controls generously.
* Round major cards even more generously.
* Make avatars and member identity visually important.
* Distinguish synchronized ASC identity from user customization.
* Keep dashboard and admin surfaces calmer than the homepage.
* Use translucent surfaces over custom backgrounds.
* Maintain readable contrast regardless of customization.
* Use profile/member imagery instead of generic stock art.
* Design mobile behavior alongside desktop.
* Respect reduced motion.
* Design empty/error/loading states.
* Keep user customization inside predefined safe properties.
* Reuse the same profile components in preview and public rendering.
* Keep the design compatible with future widgets, achievements, statistics, and cosmetics.

---

# Don'ts

* Don't flatten ASC into generic gray SaaS styling.
* Don't use pure black as the universal background.
* Don't use green everywhere.
* Don't introduce unnecessary loud accent colors.
* Don't square off major cards.
* Don't rely on heavy shadows for every layer.
* Don't make every page as visually loud as the homepage.
* Don't use giant display typography inside dense dashboard tables.
* Don't allow custom backgrounds to destroy readability.
* Don't let users inject arbitrary CSS, HTML, or scripts.
* Don't visually confuse ASC tags with synchronized roles.
* Don't visually confuse editable information with synchronized identity.
* Don't expose internal IDs.
* Don't use animations for essential functionality.
* Don't communicate status using color alone.
* Don't build desktop-only interfaces.
* Don't create separate visual languages for every page.
* Don't overdecorate administration interfaces.
* Don't make future gamification more visually important than member identity.

---

# Design Tokens

Agents should centralize these values rather than repeatedly hardcoding them.

```ts
export const colors = {
  primary: "var(--asc-primary)",
  primaryHover: "var(--asc-primary-hover)",
  primarySoft: "var(--asc-primary-soft)",
  green: "#35ed7e",
  magenta: "#ec48bd",
  link: "#00b0f4",

  canvas: "var(--asc-canvas)",
  surfaceIndigo: "var(--asc-surface-indigo)",
  surfaceOnyx: "var(--asc-surface-onyx)",
  surfaceBlack: "var(--asc-surface-black)",
  surfaceHover: "var(--asc-surface-hover)",
  surfaceActive: "var(--asc-surface-active)",

  ink: "var(--asc-ink)",
  inkDark: "var(--asc-ink-dark)",
  inkSecondary: "var(--asc-ink-secondary)",
  muted: "var(--asc-muted)",

  success: "#35ed7e",
  warning: "#f0b232",
  danger: "#ed4245",
  info: "#00b0f4",
};
```

```ts
export const radius = {
  xs: "6px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "24px",
  "2xl": "40px",
  pill: "50px",
  jumbo: "120px",
  full: "9999px",
};
```

```ts
export const spacing = {
  xxs: "4px",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  xxl: "32px",
  section: "40px",
  sectionLg: "64px",
  sectionXl: "96px",
};
```

---

# Agent Implementation Rules

When an AI coding agent builds ASC, it must follow these rules.

## 1. Reuse the system

Do not invent random colors, radii, shadows, typography, or spacing when an existing token applies.

---

## 2. Build reusable components

Do not duplicate major UI implementations.

Prefer:

```text
MemberCard
IdentityCard
ProfileWidget
RoleChip
TagChip
SupporterBadge
StatCard
EmptyState
Modal
Toast
```

---

## 3. Public and application UI are related but not identical

Public ASC pages may be expressive.

Dashboard/admin pages must prioritize usability.

Both still use the same tokens.

---

## 4. Identity must remain trustworthy

Synchronized identity fields must never visually appear editable.

Editable ASC profile information must remain distinguishable from synchronized information.

---

## 5. Customization cannot override usability

User themes may influence:

```text
Background
Accent
Theme
Transparency
Title
Cosmetics
```

They may not override:

```text
Navigation usability
Accessibility
Security controls
Administrative controls
Critical text contrast
Application structure
```

---

## 6. Mobile is not optional

Every component must be tested conceptually at:

```text
375px
768px
1024px
1280px+
```

---

## 7. Avoid premature complexity

Do not implement future visual systems unless required by the current feature.

The design system is future-compatible, not an instruction to build every future feature immediately.

---

## 8. Use semantic components

Prefer:

```html
<nav>
<main>
<section>
<article>
<button>
<a>
<form>
<label>
```

rather than making every element a generic `<div>`.

---

## 9. Accessibility is part of the design

Accessibility requirements are not optional cleanup work.

They must be considered while implementing components.

---

## 10. Preserve ASC identity

When uncertain, the hierarchy is:

```text
Community
   ↓
People
   ↓
Identity
   ↓
Expression
   ↓
Gamification
```

ASC is fundamentally about the people in the community.

Achievements, statistics, cosmetics, events, and future features exist to enrich member identity — not replace it.

---

# Final Design Direction

ASC should feel like:

**a living digital community space**

rather than:

**a database of member records.**

It should feel expressive without becoming chaotic.

It should feel playful without becoming childish.

It should feel technically polished without becoming corporate.

It should allow individual profiles to feel unique without making every profile look like it belongs to a completely different website.

The visual formula is:

```text
Deep Indigo Foundation
        +
Violet / Magenta Atmosphere
        +
Bold Typography
        +
Large Soft Geometry
        +
Member Identity
        +
Controlled Personalization
        +
Subtle Motion
        =
ASC
```

When implementing a new ASC surface, ask:

> Does this make the community and its members feel more alive while remaining recognizable, usable, and consistent with ASC?

If yes, it belongs in the system.
