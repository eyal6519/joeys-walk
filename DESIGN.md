---
name: Joey's Log
description: A warm, daylight household log for one toy poodle's walks and potty breaks.
colors:
  surface: "#f5f2ec"
  surface-sunken: "#ece7dc"
  surface-raised: "#ffffff"
  ink: "#241c15"
  ink-soft: "#4c4136"
  ink-muted: "#6f6252"
  brand: "#a9713f"
  brand-strong: "#8a5626"
  brand-soft: "#f0e4d4"
  line: "#e6dfd2"
  line-strong: "#d3c8b6"
  pee: "#a96f16"
  poop: "#6b4526"
  live: "#2f6b4f"
  success: "#3f7d57"
  danger: "#b5432f"
  found: "#c33f2d"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  card: "1.25rem"
  control: "0.875rem"
  pill: "999px"
spacing:
  xs: "0.375rem"
  sm: "0.625rem"
  md: "0.75rem"
  lg: "1.5rem"
  page: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-strong}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  action-tile:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem"
    height: "4.25rem"
---

## Overview

Joey's Log is a **task app for one household**, used one-handed, outdoors, in
daylight and after dark. The visitor's success is a job done: answering "when did
Joey last go?" at a glance, then logging a find or a walk in a couple of taps.

This is an **Operate** surface. Brand lives in precise details — a committed
palette, real type, drawn icons, and one deliberate moment — never in decoration
over the working screen. The design's ambition is expressed as clarity, warmth and
restraint.

The world is a warm household log kept in daylight: paper, espresso ink, a single
brown brand, and two data colours that carry meaning (pee, poop). Everything else
is a standard control the user already knows how to use.

## Colors

- **Brand** (`brand` `#a9713f`, `brand-strong` `#8a5626`, `brand-soft` `#f0e4d4`):
  the poodle-brown identity. `brand-strong` is the only value used for text and
  primary fills because it clears contrast on the warm ground; `brand` is for
  larger marks and accents; `brand-soft` fills selected and highlight states.
- **Ink** (`ink`, `ink-soft`, `ink-muted`): a warm espresso scale, never pure
  black. `ink-muted` is the quietest text that still clears 4.5:1 on `surface`.
- **Ground** (`surface`, `surface-sunken`, `surface-raised`): warm paper, a sunken
  track for segmented controls, and white cards for the reading layer.
- **Data** (`pee` amber `#a96f16`, `poop` umber `#6b4526`): the two potty results
  own these colours everywhere — icons, chips, the stats chart — so the same fact
  reads the same across the app.
- **Live** (`live` `#2f6b4f`): an in-progress walk and its timer. The only green,
  so green always means "happening now".
- **Found** (`found` `#c33f2d`): the at-home marker on the day rule. A find
  spotted indoors is red; a walk is a light marker, so the two read apart at a
  glance. It is deliberately separate from `danger` so red-as-marker never erodes
  red-as-error.
- **State** (`success`, `danger`): reserved for confirmation and failure, plus
  `line` / `line-strong` for borders and rules.

Dark mode redefines the same token names under `prefers-color-scheme: dark`, so
no component carries `dark:` variants and every surface adapts at once.

## Typography

Two self-hosted families, no hosted stylesheet at runtime:

- **Bricolage Grotesque** (`display`) is the voice: the big interval figure, page
  titles, the wordmark. It is set tight (`-0.02em` to `-0.03em`) and heavy (800).
- **Hanken Grotesk** (`body`, `label`) is the workhorse: all body copy, controls,
  and the uppercase `label` (0.14em tracking, 700) used for section headers and
  field labels.

Numbers that can change while the user watches — the interval, the walk timer,
counts — are set with `font-variant-numeric: tabular-nums` so digits do not jump.
The type scale is deliberate and small: display, title, body, label, caption.

## Layout

- Single column, `max-width: 42rem`, `1.25rem` page gutter, `1.5rem` between
  major blocks. Content sits above a fixed bottom navigation.
- **Mobile-first and thumb-first.** Primary actions are full-width rows at least
  68px tall; the bottom nav is reachable by either thumb; the logging screens
  hide the nav to keep the task focused.
- Density is comfortable, not dense: the home screen is four blocks — the glance
  answer, the two actions, the day rule, today's list.

## Elevation & Depth

Depth is warm and soft, from two tokens rather than ad-hoc shadows:
`shadow-card` for resting surfaces (a hairline plus a wide low shadow) and
`shadow-pop` for floating layers like toasts. Borders (`line`, `line-strong`) do
most of the structural work; shadows only lift.

## Shapes

- `rounded.card` (1.25rem) for cards and the hero; `rounded.control` (0.875rem)
  for buttons, tiles, inputs and list rows; `rounded.pill` for badges and chips.
- Icon containers are `0.7rem`–`0.9rem` rounded squares; the brand mark sits in a
  rounded square beside its heading, never as a lone tile above it.
- Icons are one drawn set (24px, 1.75 stroke, round caps/joins, `currentColor`).
  Emoji are never used as interface icons.

## Components

- **ActionTile** — the home screen's two primary actions ("Found something at
  home", "Going for a walk?"). Large, full-width, icon badge + title + subtitle.
  The walk tile becomes a live timer panel when a walk is running.
- **Segmented** — a single segmented track for mutually exclusive choices (walk
  vs. found; stats period). The active segment is raised; the rest are quiet.
- **ChoiceGroup** — native radios styled as selectable tiles (potty result, place,
  walker). Keyboard and screen-reader behaviour is the platform's.
- **TodaySummary** — the glance: a large tabular interval, what/where/who, a
  **day rule** (the day's events as ticks on a 24-hour rule with the current gap
  in brand and "now" as a cursor), and a four-count row. On the rule a **walk is
  a light marker and an at-home find is the red `found` marker**; pressing a
  marker reveals that entry's essentials inline below the rule (when, and by
  whom/what for a walk; when spotted and where for a find) — a non-modal reveal,
  never a modal for a task that needs no interruption.
- **LogItem** — one entry: a potty-tinted icon badge, what and where, the time.
  Tapping opens the edit screen.
- **Button** — `primary` (brand-strong fill), `secondary` (raised with a border),
  `danger`, `ghost`; `0.98` press scale, never a bounce.

## Do's and Don'ts

- **Do** keep the two logging actions one tap from the home screen and reachable
  by one thumb.
- **Do** use `pee` / `poop` / `live` colours for their one meaning every time.
- **Do** keep offline writes fire-and-forget and surface failures as toasts.
- **Don't** add analytics the family did not ask for; stats stay simple counts
  and one chart.
- **Don't** put brand chrome, gradients, or themed ornament over a working screen.
- **Don't** introduce emoji as icons, a second accent hue, or colours that fight
  the warm ground.
- **Don't** ship a light-mode-only colour; every token has a dark counterpart.
