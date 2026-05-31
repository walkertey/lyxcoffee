# 龍運轩咖啡店 WhatsApp Ordering System

Mobile-first WhatsApp ordering page for 龍運轩咖啡店 / KEDAI KOPI B.Siput.

## Scope

This project keeps the business flow intentionally simple:

- no login
- no membership
- no payment
- no backend
- no database
- one customer cart
- split WhatsApp order messages by stall/vendor

## Stalls

- 水档
- 面档
- 如月小吃 / 煮炒档
- 广西卷肠粉档

当前订单模式为四档口真实 WhatsApp 直达。vendors 配置必须保持一档一号，不得回退为统一 intake 号码。

## Local commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

`npm run build` runs TypeScript type checking first, then Vite production build.

## Image drop-in

Put final WebP files into:

```txt
public/assets/
```

Required filenames:

```txt
hero-kopitiam.webp
shop-front.webp
drinks-counter.webp
noodles.webp
wok-cooking.webp
chee-cheong-fun.webp
```

The app already references these paths. If the files are missing, gradient fallbacks are used and the project still builds.

## Business data

Menu, vendor names, prices, and WhatsApp numbers are defined in:

```txt
src/app/data.ts
```

Order text, split-order logic, storage, price formatting, and WhatsApp URL generation are defined in:

```txt
src/app/utils.ts
```

Main UI flow is in:

```txt
src/app/App.tsx
```

## Operating notes

This package uses npm. Do not use pnpm for this project unless the lockfile and documentation are intentionally migrated together.

当前订单模式为四档口真实 WhatsApp 直达。vendors 配置必须保持一档一号，不得回退为统一 intake 号码。

Customer phone numbers are validated as Malaysian mobile numbers. Free-text fields are length-limited to reduce the risk of WhatsApp URL truncation.
