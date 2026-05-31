# Gate Fix Report — 2026-05-31

Project: 龍運轩咖啡店 WhatsApp 点餐系统
Source package: long-yun-xuan-whatsapp-order-code-repaired.zip
Gate input: PASS_WITH_CONDITIONS report, v5.1 Hardened

## Result

Gate status after fixes: PASS_WITH_CONDITIONS, lower risk.

Remaining condition: four vendors still route to the same WhatsApp main intake number because no separate stall-owner phone numbers were provided. This is now documented as an intentional single-intake operating mode. To enable true per-vendor delivery, update the four `whatsapp` fields in `src/app/data.ts`.

## Fixed items

### HIGH-02 — Customer phone validation

Added Malaysian mobile validation after stripping spaces, symbols, and `+60` prefix.

Accepted examples:

- `0123456789`
- `012-345 6789`
- `+60123456789`

Invalid strings such as `abc` or `00000` are blocked before order generation.

### MEDIUM-01 — Free-text length limits

Added max length limits:

- Customer name: 40
- Customer phone: 15
- Whole-order note: 200
- Per-item note: 80

The per-item note update utility also truncates to 80 characters as a data-layer guard.

### MEDIUM-02 — dist in source package

Added `.gitignore` with `dist/` and `node_modules/` ignored. The final source zip excludes `dist/`.

### MEDIUM-03 — npm / pnpm conflict

Removed `pnpm-workspace.yaml`. Project is now npm-only with `package-lock.json`.

### LOW-01 — buildCustomerOrder preview memoization

Added `useMemo` for customer info and customer order preview.

### LOW-02 — duplicate money alias

Removed the `money()` alias and unified simple menu price rendering to `centsToMoney()`.

### LOW-03 — item.price non-null assertion

Removed `item.price!` non-null assertions in `SimpleMenuRow.tsx`. Added a safe guard for no-price items.

## Assets integrated

The six uploaded images were converted into valid WebP files and placed in both `public/assets/` and `src/assets/`:

- `hero-kopitiam.webp`
- `shop-front.webp`
- `drinks-counter.webp`
- `noodles.webp`
- `wok-cooking.webp`
- `chee-cheong-fun.webp`

The app references `/assets/*.webp`, so the runtime source is `public/assets/`.

## Build verification

Command executed:

```bash
npm install --no-audit --no-fund
npm run build
```

Result:

```txt
tsc --noEmit passed
vite build passed
```
