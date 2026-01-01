# shadcn/ui Component Update Analysis

> Generated: 2026-01-01
> Comparing: `packages/client/src/components/ui/` against shadcn/ui v4 (new-york-v4)

## Overview

This document analyzes the current shadcn/ui components in the project against the latest upstream versions to identify valuable updates worth implementing.

### Key Changes in shadcn/ui v4

- Uses `data-slot` attributes for better CSS targeting and debugging
- Many components now use `@radix-ui/react-slot` for polymorphism (`asChild` pattern)
- New accessibility features with `aria-invalid` ring styles
- Simplified variant patterns and improved focus-visible states
- Better dark mode support with patterns like `dark:bg-input/30`

---

## Components Worth Updating (High Value)

### 1. Button

**Current:** Custom `tv()` implementation with loading state, accent variants
**Latest:** Significant new features

| Feature | Current | Latest |
|---------|---------|--------|
| Variants | default, destructive, outline, ghost | + secondary, link |
| Sizes | default, sm, lg, icon | + icon-sm, icon-lg |
| Focus ring | `focus-visible:ring-2` | `focus-visible:ring-[3px]` with ring/50 opacity |
| aria-invalid | No | Yes - ring-destructive styles |
| data attributes | No | data-slot, data-variant, data-size |
| SVG sizing | `[&_svg]:size-4` | `[&_svg:not([class*='size-'])]:size-4` (respects custom sizes) |
| Conditional padding | No | `has-[>svg]:px-3` |

**Latest source:**
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Recommendation:** Update to add new variants/sizes while keeping custom `loading`, `accent`, and `active` props.

---

### 2. Badge

**Current:** Uses `<div>`, custom domain variants (trakt, mdblist, etc.)
**Latest:** Uses `<span>`, supports `asChild`

| Feature | Current | Latest |
|---------|---------|--------|
| Element | `<div>` | `<span>` |
| asChild | No | Yes |
| Focus states | No | Yes - focus-visible ring |
| aria-invalid | No | Yes |
| data-slot | No | Yes |
| overflow | No | `overflow-hidden` |

**Latest source:**
```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90...",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
  }
)

function Badge({ asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span"
  return <Comp data-slot="badge" ... />
}
```

**Recommendation:** Change to `<span>`, add `asChild` support, keep domain-specific variants.

---

### 3. Card

**Current:** Custom CardContext for variant propagation, status variants
**Latest:** New CardAction component, @container queries

| Feature | Current | Latest |
|---------|---------|--------|
| CardAction | No | Yes - for header action buttons |
| Container queries | No | `@container/card-header` |
| Variant context | Yes (custom) | No |
| Status variants | Yes (custom) | No |
| data-slot | No | Yes |
| Default gap | `gap-1.5` in header | `gap-6` in card, `gap-2` in header |

**Latest CardAction:**
```tsx
function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}
```

**Recommendation:** Add CardAction while keeping CardContext and status variants.

---

### 4. Input

**Current:** Has validation variants (success/error)
**Latest:** Better selection, file upload, and invalid styles

| Feature | Current | Latest |
|---------|---------|--------|
| Selection styling | No | `selection:bg-primary selection:text-primary-foreground` |
| File input styling | No | Full file input styles |
| aria-invalid | No | Yes - ring colors |
| Height | h-10 | h-9 |
| data-slot | No | Yes |
| Dark mode bg | No | `dark:bg-input/30` |

**Latest source:**
```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}
```

**Recommendation:** Merge selection/file styles while keeping validation variants.

---

### 5. Table

**Current:** Custom hover styles, rounded corners on last row
**Latest:** data-slot attributes, selected state, whitespace handling

| Feature | Current | Latest |
|---------|---------|--------|
| data-slot | No | Yes on all elements |
| Row selection | No | `data-[state=selected]:bg-muted` |
| Whitespace | No | `whitespace-nowrap` on head/cell |
| Checkbox alignment | Manual | `[&>[role=checkbox]]:translate-y-[2px]` |
| Footer bg | `bg-card` | `bg-muted/50` |

**Recommendation:** Add data-slot and selection state support.

---

## Components That Are Good As-Is (Low Priority)

| Component | Notes |
|-----------|-------|
| **Dialog** | Nearly identical, just add `data-slot` if desired |
| **AlertDialog** | Matches latest structure closely |
| **Sheet** | Very close to latest, tv() usage is fine |
| **Select** | Functionally equivalent |
| **DropdownMenu** | Functionally equivalent, has useful modal={false} docs |
| **Tooltip** | Matches well, has TooltipArrow which latest doesn't export |
| **Switch** | Minimal differences |
| **Separator** | Simple component, no changes needed |
| **Label** | Simple component, no changes needed |
| **RadioGroup** | Functionally equivalent |

---

## Custom Enhancements to Preserve

These are valuable customizations that should be kept during updates:

### Button
- `loading` prop with Loader2 spinner
- `accent` variant (purple theming)
- `active` state for active button indication
- `border-2 border-transparent` base style

### Card
- `CardContext` for variant propagation to children
- Status variants: success, destructive, warning, info
- `cardTitleVariants` and `cardDescriptionVariants` with status colors

### Badge
- Domain-specific variants: trakt, traktChart, mdblist, stevenlu
- Status variants: success, destructive, warning, info, scheduled, manual

### Input
- Validation variants: default, success, error
- Ring color variants for validation states

### Dialog/Sheet/DropdownMenu
- Excellent `modal={false}` documentation comments explaining scrollbar-gutter stability

---

## Implementation Checklist

### Phase 1: High-Impact Updates
- [ ] Button: Add secondary, link variants; icon-sm, icon-lg sizes; data-slot attributes
- [ ] Badge: Change to `<span>`, add asChild support
- [ ] Card: Add CardAction component
- [ ] Input: Add selection and file upload styles

### Phase 2: Polish Updates
- [ ] Table: Add data-slot attributes and selection state
- [ ] Add data-slot to Dialog, Sheet, AlertDialog components

### Phase 3: Optional Improvements
- [ ] Consider adding new components: InputGroup, ButtonGroup, Field, Spinner
- [ ] Consider Sonner for toasts (replaces custom toast implementation)

---

## New Components Available in shadcn/ui v4

These components are new in v4 and might be worth adding:

| Component | Purpose |
|-----------|---------|
| **InputGroup** | Input with addons (icons, buttons, text) |
| **ButtonGroup** | Grouped buttons with separators |
| **Field** | Form field wrapper with label, description, error |
| **Spinner** | Loading spinner component |
| **Kbd** | Keyboard shortcut display |
| **Empty** | Empty state component |
| **HoverCard** | Hover-triggered card popup |

---

## Notes on tv() vs cva()

The project uses `tailwind-variants` (tv()) instead of `class-variance-authority` (cva()).

The adaptation is straightforward:
- `cva(base, { variants })` → `tv({ base, variants })`
- Both support `compoundVariants` and `defaultVariants`
- tv() additionally supports `slots` for multi-element components

No functional differences for the component patterns used here.
