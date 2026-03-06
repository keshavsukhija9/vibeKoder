# VibeCoder UI Audit & Uniformity

**Date:** March 2026  
**Goal:** Landing-inspired UI applied consistently across all pages.

---

## Design system (from landing)

- **Tokens:** `--vibe-bg`, `--vibe-surface`, `--vibe-primary`, `--vibe-secondary`, `--vibe-glow`, `--vibe-text`, `--vibe-text-muted`, `--vibe-border`, `--vibe-radius`, `--vibe-shadow`, `--vibe-shadow-hover`, `--font-display`, `--font-body`
- **Background:** `#FAFBFF` (--vibe-bg)
- **Surfaces:** White cards, `rounded-2xl` or `rounded-[var(--vibe-radius)]`, `border-[var(--vibe-border)]`, `shadow-[var(--vibe-shadow)]`
- **Navbar:** Fixed, frosted glass (`bg-white/80 backdrop-blur-[20px]`), border-b, max-w-[1280px], logo "VibeCoder" + gradient accent, pill CTAs
- **Typography:** Display font for headings, body for text; headline sizes clamp(2.5rem, 6vw, 5.5rem)
- **CTAs:** Pill shape (`rounded-full`), primary gradient or outline border, hover scale/shadow

---

## Routes audited

| Route | Purpose | Uses vibe tokens? | Navbar | Notes |
|-------|---------|-------------------|--------|--------|
| `/` | Landing | Yes (hero, bento, etc.) | LandingNavbar | Reference |
| `/dashboard` | Project list | Partial (page uses some; add-new used custom red) | Sidebar only | Add app navbar; unify cards |
| `/auth/sign-in` | Sign in / register | Yes (card, links) | None | Add minimal header/logo |
| `/playground/[id]` | IDE | Partial (shadcn defaults) | None (IDE chrome) | Ensure shell uses vibe-bg |

---

## Components audited

| Component | Location | Alignment |
|-----------|----------|-----------|
| Hero, FeaturesBento, etc. | modules/landing | Reference |
| Dashboard page | app/dashboard/page.tsx | Uses vibe; banner + grid |
| EmptyState | modules/dashboard | Uses vibe (radius, surface, primary) |
| AddNewButton | modules/dashboard | **Was** custom red; **now** vibe primary/surface |
| ProjectTable | modules/dashboard | Uses shadcn Table; cards use vibe in audit pass |
| DashboardSidebar | modules/dashboard | Shadcn sidebar; bg already neutral |
| Sign-in page | app/(auth)/auth/sign-in | Card uses vibe; wrapper unified |
| Playground page | app/playground/[id] | IDE; outer bg uses vibe-bg |

---

## Changes made for uniformity

1. **Shared AppNavbar** – Frosted bar, VibeCoder logo, Home + Dashboard links, matches landing. Used in dashboard layout.
2. **Dashboard layout** – AppNavbar above sidebar + main; main area keeps vibe-bg.
3. **Dashboard cards** – Add-new and dashboard banner use vibe tokens (primary, surface, border, radius, shadow).
4. **Auth layout** – Same vibe-bg; sign-in card uses rounded-2xl and vibe shadow/border.
5. **Playground shell** – Outer container uses vibe-bg where applicable so IDE feels part of same product.
6. **Global** – All app pages use `bg-[var(--vibe-bg)]` and shared tokens for surfaces and typography.

---

## Checklist

- [x] Landing: reference (no change)
- [x] Dashboard: AppNavbar + vibe tokens on cards/banner/add-new
- [x] Auth: vibe card and layout
- [x] Playground: vibe-bg on shell
- [x] Docs: UI-AUDIT.md created
