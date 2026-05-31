# Project Handoff — 龍運轩 WhatsApp Ordering System

## Current status

Code repair is complete for the non-image phase.

Verified commands:

```bash
npm install --no-audit --no-fund
npm run build
```

Build result: PASS.

## Fixed in this pass

1. Removed unused shadcn/ui generated component dump that required many unused dependencies.
2. Added strict `tsconfig.json`.
3. Added `npm run typecheck` and made `npm run build` run typecheck before Vite build.
4. Repaired mobile hamburger button so it opens a real menu instead of pretending to be a menu while navigating home.
5. Reset order progress when customer name, phone, order type, or order note changes.
6. Kept order progress reset on cart quantity and item note changes.
7. Kept WhatsApp opened state separate from confirmed sent state.
8. Kept `buildWhatsAppUrl()` centralized with phone normalization and `encodeURIComponent()`.
9. Added image drop-in support through `/assets/*.webp` with gradient fallback.
10. Updated vendor WhatsApp routing to real four-stall direct numbers.

## Image filenames still required

Place real final images into `public/assets/`:

```txt
hero-kopitiam.webp
shop-front.webp
drinks-counter.webp
noodles.webp
wok-cooking.webp
chee-cheong-fun.webp
```

## Hard rules for future edits

Do not change:

- shop name
- menu item names
- prices
- four-stall grouping
- four-stall one-number-per-vendor WhatsApp routing
- cart logic
- split-order logic
- `Mark as Sent` separation from `Open WhatsApp`

Do not add:

- login
- membership
- online payment
- backend
- database
- admin dashboard

## WhatsApp Routing Mode

当前订单模式为四档口真实 WhatsApp 直达。vendors 配置必须保持一档一号，不得回退为统一 intake 号码。

Do not change the cart or split-order logic when maintaining vendor WhatsApp routing.

## Input Guardrails

- Customer phone is validated as a Malaysian mobile number after stripping spaces, hyphens, and `+60` country code.
- Customer name is capped at 40 characters.
- Customer phone input is capped at 15 characters.
- Whole-order notes are capped at 200 characters.
- Per-item notes are capped at 80 characters.
