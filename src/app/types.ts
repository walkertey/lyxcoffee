export type SectionId = "home" | "drinks" | "noodles" | "wok" | "cheecheongfun" | "about" | "cart" | "confirm";

export type VendorId = "drinks" | "noodles" | "wok" | "cheecheongfun";

export interface MenuVariant {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  vendorId: VendorId;
  name: string;
  desc?: string;
  category?: string;
  price?: number;
  variants?: MenuVariant[];
}

export interface MenuGroup {
  title: string;
  mount: string;
  items: MenuItem[];
}

export interface Vendor {
  id: VendorId;
  name: string;
  whatsapp: string;
}

export type VendorMap = Record<VendorId, Vendor>;

export interface StoredCartLine {
  itemId: string;
  variantId?: string;
  qty: number;
  note: string;
}

export interface CartLine {
  key: string;
  itemId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  vendorId: VendorId;
  priceCents: number;
  qty: number;
  note: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  type: string;
  note: string;
}

export interface OrderState {
  lastOrderId: string;
  sentMap: Record<string, boolean>;
}

export interface VendorGroup {
  vendor: Vendor;
  lines: CartLine[];
}
