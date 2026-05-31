import type { CartLine, CustomerInfo, OrderState, StoredCartLine, VendorGroup, VendorId } from "./types";
import { menuGroups, vendors } from "./data";

const CART_KEY = "lyx_kopitiam_cart_v1";
const ORDER_STATE_KEY = "lyx_kopitiam_order_state_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCart(): CartLine[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return hydrateCart(parsed);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartLine[]): void {
  if (!canUseStorage()) return;

  const stored = hydrateCart(cart)
    .map(toStoredCartLine)
    .filter((line) => line.qty > 0);

  window.localStorage.setItem(CART_KEY, JSON.stringify(stored));
}

export function loadOrderState(): OrderState {
  if (!canUseStorage()) return { lastOrderId: "", sentMap: {} };

  try {
    const raw = window.localStorage.getItem(ORDER_STATE_KEY);
    if (!raw) return { lastOrderId: "", sentMap: {} };
    const parsed = JSON.parse(raw) as Partial<OrderState>;
    return {
      lastOrderId: typeof parsed.lastOrderId === "string" ? parsed.lastOrderId : "",
      sentMap: parsed.sentMap && typeof parsed.sentMap === "object" ? parsed.sentMap : {},
    };
  } catch {
    return { lastOrderId: "", sentMap: {} };
  }
}

export function saveOrderState(state: OrderState): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ORDER_STATE_KEY, JSON.stringify(state));
}

export function clearOrderState(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ORDER_STATE_KEY);
}

function findMenuItem(itemId: string) {
  for (const group of menuGroups) {
    const item = group.items.find((candidate) => candidate.id === itemId);
    if (item) return item;
  }

  return undefined;
}

function buildCartKey(itemId: string, variantId?: string): string {
  return variantId ? `${itemId}:${variantId}` : itemId;
}

function sanitizeQty(value: unknown): number {
  if (!Number.isInteger(value)) return 0;
  const qty = value as number;
  if (qty <= 0) return 0;
  return Math.min(qty, 99);
}

function sanitizeNote(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 80) : "";
}

function hydrateCartLine(input: unknown): CartLine | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Partial<StoredCartLine>;
  if (typeof raw.itemId !== "string") return null;
  if (raw.variantId !== undefined && typeof raw.variantId !== "string") return null;

  const item = findMenuItem(raw.itemId);
  if (!item) return null;

  const variant = raw.variantId
    ? item.variants?.find((candidate) => candidate.id === raw.variantId)
    : undefined;

  if (raw.variantId && !variant) return null;

  const priceCents = variant?.price ?? item.price;
  if (typeof priceCents !== "number" || !Number.isFinite(priceCents) || priceCents < 0) return null;

  const qty = sanitizeQty(raw.qty);
  if (qty <= 0) return null;

  return {
    key: buildCartKey(item.id, variant?.id),
    itemId: item.id,
    variantId: variant?.id,
    name: item.name,
    variantLabel: variant?.label,
    vendorId: item.vendorId,
    priceCents,
    qty,
    note: sanitizeNote(raw.note),
  };
}

function toStoredCartLine(line: CartLine): StoredCartLine {
  return {
    itemId: line.itemId,
    variantId: line.variantId,
    qty: sanitizeQty(line.qty),
    note: sanitizeNote(line.note),
  };
}

export function hydrateCart(cart: unknown[]): CartLine[] {
  return cart
    .map(hydrateCartLine)
    .filter((line): line is CartLine => line !== null);
}

export function addToCart(cart: CartLine[], itemId: string, variantId?: string): CartLine[] {
  const item = findMenuItem(itemId);
  if (!item) return cart;

  const variant = item.variants?.find((candidate) => candidate.id === variantId);
  const priceCents = variant?.price ?? item.price;
  if (typeof priceCents !== "number") return cart;

  const key = buildCartKey(item.id, variant?.id);
  const existing = cart.find((line) => line.key === key);

  if (existing) {
    return cart.map((line) => (line.key === key ? { ...line, qty: sanitizeQty(line.qty + 1) } : line));
  }

  const line: CartLine = {
    key,
    itemId: item.id,
    variantId: variant?.id,
    name: item.name,
    variantLabel: variant?.label,
    vendorId: item.vendorId,
    priceCents,
    qty: 1,
    note: "",
  };

  return [...cart, line];
}

export function changeQty(cart: CartLine[], key: string, delta: number): CartLine[] {
  return cart
    .map((line) => {
      if (line.key !== key) return line;
      const nextQty = sanitizeQty(line.qty + delta);
      return nextQty <= 0 ? null : { ...line, qty: nextQty };
    })
    .filter((line): line is CartLine => line !== null);
}

export function updateLineNote(cart: CartLine[], key: string, note: string): CartLine[] {
  const safeNote = note.slice(0, 80);
  return cart.map((line) => (line.key === key ? { ...line, note: safeNote } : line));
}

export function getCartCount(cart: CartLine[]): number {
  return cart.reduce((total, line) => total + line.qty, 0);
}

export function getLineUnitCents(line: CartLine): number {
  return line.priceCents;
}

export function getCartItemTotalCents(line: CartLine): number {
  return line.priceCents * line.qty;
}

export function getCartTotalCents(cart: CartLine[]): number {
  return cart.reduce((total, line) => total + getCartItemTotalCents(line), 0);
}

export function centsToMoney(cents: number): string {
  return `RM ${(cents / 100).toFixed(2)}`;
}

export function moneyShort(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function groupCart(cart: CartLine[]): VendorGroup[] {
  const grouped = new Map<string, CartLine[]>();

  for (const line of cart) {
    if (line.qty <= 0) continue;
    const current = grouped.get(line.vendorId) ?? [];
    current.push(line);
    grouped.set(line.vendorId, current);
  }

  return Array.from(grouped.entries())
    .map(([vendorId, lines]) => ({ vendor: vendors[vendorId as keyof typeof vendors], lines }))
    .filter((group): group is VendorGroup => Boolean(group.vendor) && group.lines.length > 0);
}

export function generateOrderId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LYX-${date}-${time}-${random}`;
}

function formatLine(line: CartLine, includePrice: boolean): string {
  const variant = line.variantLabel ? `（${line.variantLabel}）` : "";
  const note = line.note.trim() ? `
   备注：${line.note.trim()}` : "";
  const price = includePrice ? ` = ${centsToMoney(getCartItemTotalCents(line))}` : "";
  return `- ${line.name}${variant} x${line.qty}${price}${note}`;
}

function formatCustomerBlock(customer: CustomerInfo): string[] {
  const lines = [
    `顾客：${customer.name || "未填写"}`,
    `电话：${customer.phone || "未填写"}`,
    `类型：${customer.type || "打包"}`,
  ];

  if (customer.note.trim()) {
    lines.push(`总备注：${customer.note.trim()}`);
  }

  return lines;
}

export function buildCustomerOrder(orderId: string, cart: CartLine[], customer: CustomerInfo): string {
  const lines: string[] = [
    "龍運轩咖啡店 · 顾客总订单",
    `订单编号：${orderId || generateOrderId()}`,
    ...formatCustomerBlock(customer),
    "",
    "【订单明细】",
  ];

  for (const group of groupCart(cart)) {
    lines.push("", `【${group.vendor.name}】`);
    for (const line of group.lines) {
      lines.push(formatLine(line, true));
    }
    const subtotal = group.lines.reduce((total, line) => total + getCartItemTotalCents(line), 0);
    lines.push(`小计：${centsToMoney(subtotal)}`);
  }

  lines.push("", `总计：${centsToMoney(getCartTotalCents(cart))}`);
  return lines.join("\n");
}

export function buildVendorOrder(orderId: string, cart: CartLine[], customer: CustomerInfo, vendorId: VendorId): string {
  const vendor = vendors[vendorId];
  const vendorLines = cart.filter((line) => line.vendorId === vendorId && line.qty > 0);
  const subtotal = vendorLines.reduce((total, line) => total + getCartItemTotalCents(line), 0);

  const lines: string[] = [
    `龍運轩咖啡店 · ${vendor?.name ?? "档口"}分单`,
    `订单编号：${orderId || generateOrderId()}`,
    ...formatCustomerBlock(customer),
    "",
    "【本档口商品】",
  ];

  for (const line of vendorLines) {
    lines.push(formatLine(line, false));
  }

  lines.push("", `本档口小计：${centsToMoney(subtotal)}`);
  return lines.join("\n");
}

export function normalizeMalaysianMobile(input: string): string {
  const digits = input.replace(/[^0-9]/g, "");

  if (digits.startsWith("60")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("1")) {
    return `0${digits}`;
  }

  return digits;
}

export function isValidMalaysianMobile(input: string): boolean {
  return /^01[0-9]{8,9}$/.test(input);
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error("Clipboard API is not available");
}
