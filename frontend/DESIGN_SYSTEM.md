# Notes Challenge Design System

TailwindCSS design tokens derived from the provided views and components.

## Usage

All tokens are available as Tailwind utilities. Import `globals.css` (already done in `layout.tsx`) and use the classes below.

---

## Colors

### Note Colors (solid – dots, accents)

| Token | Hex | Utilities |
|-------|-----|------------|
| Orange | `#EF9C66` | `bg-note-orange`, `text-note-orange`, `border-note-orange` |
| Yellow | `#FCDC94` | `bg-note-yellow`, `text-note-yellow`, `border-note-yellow` |
| Sage | `#C8CFA0` | `bg-note-sage`, `text-note-sage`, `border-note-sage` |
| Teal | `#78ABA8` | `bg-note-teal`, `text-note-teal`, `border-note-teal` |

### Card Backgrounds (50% opacity)

| Token | Utilities |
|-------|-----------|
| Orange card | `bg-note-orange-card` |
| Yellow card | `bg-note-yellow-card` |
| Sage card | `bg-note-sage-card` |
| Teal card | `bg-note-teal-card` |

### Borders & Accent

| Token | Hex | Utilities |
|-------|-----|-----------|
| Border | `#957139` | `border-border`, `text-border`, `bg-border` |
| Accent | `#957139` | `border-accent`, `text-accent`, `bg-accent` |

### Backgrounds

| Token | Hex | Utilities |
|-------|-----|-----------|
| Page/Cream | `#FAF1E3` | `bg-bg`, `bg-bg-cream` |
| Warm | `#EF9C66` | `bg-bg-warm` |

### Hover/Active

| Token | Utilities |
|-------|-----------|
| Hover overlay | `#957139` @ 20% | `bg-hover`, `hover:bg-hover` |

---

## Typography

| Role | Font | Utilities |
|------|------|------------|
| Headings | Inria Serif | `font-heading` |
| Body/Text | Inter | `font-body` |

Base styles: `body` uses `font-body`, `h1–h6` use `font-heading`.

---

## Radius

| Token | Value | Utilities |
|-------|-------|------------|
| Card | 12px | `rounded-card` |
| Chip/Tag/Dropdown | 6px | `rounded-chip` |

---

## Shadow

| Token | Value | Utilities |
|-------|-------|------------|
| Card | `1px 1px 2px 0 rgb(0 0 0 / 0.25)` | `shadow-card` |

---

## Border

- Width: `1px` (Tailwind default `border`)
- Color: `border-border` or `border-accent`

---

## Component Patterns

### Note Card

```html
<div class="rounded-card border border-border bg-note-orange-card p-4 shadow-card font-body">
  <p class="text-sm text-gray-600 font-body">month day Category</p>
  <h2 class="text-xl font-bold font-heading">Note Title</h2>
  <p class="text-sm font-body">Note content...</p>
</div>
```

### Category Tag

```html
<span class="inline-flex items-center gap-1.5 rounded-chip border border-border px-3 py-1 font-body">
  <span class="h-2 w-2 rounded-full bg-note-orange"></span>
  Random Thoughts
</span>
```

### Button (primary)

```html
<button class="rounded-card border border-border bg-bg px-4 py-2 font-body shadow-card hover:bg-hover">
  + New Note
</button>
```

### Input / Dropdown

```html
<input class="w-full rounded-chip border border-border px-3 py-2 font-body shadow-card" />
```
