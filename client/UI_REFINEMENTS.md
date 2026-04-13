# Course4Me Design System

Living reference for the "Elegant & Minimalist" UI system introduced in Phase 4.
All tokens live in [`tailwind.config.js`](./tailwind.config.js); all primitives
live under [`src/components/common/`](./src/components/common/). Prefer these
over raw utility classes or one-off components.

All user-facing copy is Hebrew/RTL. Wrap layout roots in `dir="rtl"` when the
parent does not already do so.

---

## Design tokens

### Colors (semantic)

| Token                  | Use                                             |
|------------------------|-------------------------------------------------|
| `bg-surface`           | App background (subtle tint)                    |
| `bg-surface-raised`    | Cards, modals, popovers                         |
| `bg-surface-sunken`    | Inset panels, disabled states, footer rows      |
| `text-muted`           | Secondary text, hints, metadata                 |
| `text-muted-strong`    | Secondary headings                              |
| `bg-brand` / `text-brand` | Primary brand (emerald-600)                  |
| `bg-brand-soft`        | Tinted brand backgrounds (badges, pills)        |
| `bg-brand-strong`      | Hover/pressed brand states                      |
| `bg-danger`            | Destructive actions / error states              |
| `bg-danger-soft`       | Error surfaces                                  |

Raw Tailwind palette classes (`gray-*`, `emerald-*`, `red-*`) still work for
one-off decorative gradients, but new features should reach for the semantic
tokens first so global color tweaks land in one place.

### Radii

| Token            | Value    | Use                         |
|------------------|----------|-----------------------------|
| `rounded-button` | 0.75rem  | Buttons, inputs, chips      |
| `rounded-card`   | 1rem     | Standard cards              |
| `rounded-card-lg`| 1.25rem  | Modals, hero containers     |

### Shadows

| Token               | Use                                    |
|---------------------|----------------------------------------|
| `shadow-card`       | Resting state for list rows / cards    |
| `shadow-card-hover` | Interactive card hover                 |
| `shadow-elevated`   | Modals, floating menus, popovers       |
| `shadow-elevated-lg`| Full-screen modals / overlays          |

### Motion

- `duration-ui` — 200ms; the single transition duration used across hovers,
  color swaps, shadow changes, and focus rings.
- `ease-ui` — easing curve paired with `duration-ui`.
- `animate-modalEnter` — entry animation for dialog panels.
- `animate-backdropEnter` — entry animation for modal backdrops.
- `animate-fadeIn` — generic fade-in for toasts / secondary surfaces.

### Accessibility

- Use `focus-visible:ring-2 focus-visible:ring-brand` on anything clickable.
- Every modal must set `role="dialog"` and `aria-modal="true"` (the `Modal`
  primitive does this automatically).
- Disabled controls must set `aria-disabled` and keep layout stable.

---

## Primitives

All primitives live in [`src/components/common/`](./src/components/common/) and
are the default way to build new UI. They read the tokens above so you never
need to hand-roll shadows, radii, or focus rings.

### `<Card />`

Content container with consistent padding + elevation.

```jsx
import Card from "../common/Card";

<Card variant="default" padding="md">
  <h3 className="text-lg font-semibold">כותרת כרטיס</h3>
  <p className="text-muted">תיאור קצר</p>
</Card>

<Card variant="raised" interactive onClick={handleOpen}>
  {/* clickable card with hover elevation */}
</Card>
```

Props:

- `variant`: `"default" | "raised" | "sunken" | "flat"` (default `"default"`).
- `padding`: `"none" | "sm" | "md" | "lg"` (default `"md"`).
- `interactive`: toggles hover lift + cursor pointer.
- `as`: override the wrapper element (e.g. `as="article"`).

### `<Button />`

Single source of truth for actionable buttons. Handles loading state,
icons, and focus rings so feature code never touches those directly.

```jsx
import Button from "../common/Button";
import { Save, Trash2 } from "lucide-react";

<Button variant="primary" leftIcon={Save} onClick={handleSave}>
  שמור שינויים
</Button>

<Button variant="danger" leftIcon={Trash2} loading={isDeleting}>
  מחק
</Button>

<Button variant="ghost" size="sm">
  ביטול
</Button>
```

Props:

- `variant`: `"primary" | "secondary" | "ghost" | "danger"`.
- `size`: `"sm" | "md" | "lg"`.
- `leftIcon` / `rightIcon`: pass a **component reference** (lucide icon), not
  a JSX element.
- `loading`: disables the button and shows a spinner in-place.
- `fullWidth`, `as` (e.g. `as={Link}` for router links).

### `<Input />`

Text input / textarea with built-in label, hint, and error state.

```jsx
import Input from "../common/Input";
import { Search } from "lucide-react";

<Input
  label="שם הקורס"
  placeholder="הכנס שם קורס"
  leftIcon={Search}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  hint="לפחות 2 תווים"
  required
/>

<Input
  as="textarea"
  label="הערות"
  rows={4}
  error={errors.comment}
/>
```

Props: `label`, `hint`, `error`, `leftIcon`, `rightIcon`, `as`, plus every
native input/textarea attribute.

### `<Modal />`

Accessible dialog primitive. Handles the portal, escape key, body scroll lock,
backdrop click, and ARIA plumbing.

```jsx
import Modal, { ModalFooter } from "../common/Modal";
import Button from "../common/Button";

<Modal
  isOpen={isOpen}
  onClose={closeModal}
  title="עריכת ביקורת"
  description="עדכן את הפרטים ולחץ שמור"
  size="lg"
>
  <form onSubmit={handleSubmit}>
    {/* form body */}
  </form>
  <ModalFooter>
    <Button variant="ghost" onClick={closeModal}>ביטול</Button>
    <Button variant="primary" onClick={handleSubmit}>שמור</Button>
  </ModalFooter>
</Modal>
```

Props:

- `isOpen`, `onClose` (required).
- `title`, `description` — wired to `aria-labelledby` / `aria-describedby`.
- `size`: `"sm" | "md" | "lg" | "xl" | "full"`.
- `closeOnBackdrop` (default `true`), `showCloseButton` (default `true`).
- `initialFocusRef` — optional ref for initial focus target.

---

## Icon policy

**Lucide React is the only icon library.** FontAwesome was removed in Phase 4
and must not be re-added. When you need a new icon:

1. Import from `lucide-react` — e.g. `import { Pencil, Trash2 } from "lucide-react"`.
2. Size with utility classes (`w-4 h-4`, `w-5 h-5`).
3. Color with `text-*` utilities, not inline SVG attributes.

Avoid raw `<svg>` blocks inside feature components. If you genuinely need a
custom mark (logo, illustration), put it in `src/components/common/` as a
standalone component and document it here.

---

## Admin primitives

Admin panels are thin shells over the shared primitives in
[`src/components/common/admin/`](./src/components/common/admin/):

- `<FilterBar />` — search box + filter controls for list screens.
- `<ListTable />` — table renderer that owns empty/loading states.
- `<RowActions />` — trailing actions column (edit / delete / details).

Each admin panel (e.g. [`src/components/admin/CourseManagement.jsx`](./src/components/admin/CourseManagement.jsx))
is a shell that composes these primitives plus feature-specific sub-modals
(`*FormModal.jsx`, `*DetailsModal.jsx`) and a row-config helper. Keep every
file under ~250 LOC; extract helpers when you cross that line.

---

## Phase 6 guardrails (ESLint)

Enforced from [`client/package.json`](./package.json) `eslintConfig`:

- **`no-restricted-imports`** — blocks direct `axios` imports. Use
  `apiFetch` / `useApi` from [`src/hooks/useApi.js`](./src/hooks/useApi.js).
- **`no-restricted-syntax`** (error) — blocks deprecated Tailwind utilities
  (`rounded-lg`, `shadow-lg`, `duration-300`, …) in both string literals and
  template literals. Use the Phase 4 tokens above. Also blocks hardcoded
  English JSX text runs of 4+ letters — user-facing copy must be Hebrew.
  Wrap non-translatable tokens (brand names, emails, codes) in `{'...'}` to
  suppress.
- **`no-warning-comments`** (error) — blocks Hebrew characters in comments.
  Code comments must be in English so grep, diffs, and CI logs stay
  machine-readable; user-facing copy in JSX remains Hebrew.
- **`no-console`** (warn) — only `console.warn` / `console.error` allowed in
  committed code.

These rules surface in the CRA dev-server overlay and in `npm run build`.
Fix them — do not paper over with `eslint-disable`.

---

## Adoption checklist for new UI

- [ ] Container: `<Card />` with the appropriate `variant` / `padding`.
- [ ] Buttons: `<Button />` — never hand-roll `bg-emerald-500 px-4 py-2`.
- [ ] Inputs: `<Input />` — get labels, hints, and error states for free.
- [ ] Modals: `<Modal />` — never reimplement the portal + escape + focus dance.
- [ ] Icons: lucide-react only.
- [ ] Colors: semantic tokens (`bg-surface-raised`, `text-muted`, `bg-brand`).
- [ ] Motion: `duration-ui` + `ease-ui`; no ad-hoc `transition duration-300`.
- [ ] RTL: every layout root has `dir="rtl"`; every user-facing string is Hebrew.
- [ ] A11y: focus rings via `focus-visible:ring-2 focus-visible:ring-brand`.

When an older screen still uses raw utilities, migrate it opportunistically
rather than editing around it.
