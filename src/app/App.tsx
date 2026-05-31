import { useState, useEffect, useCallback, useMemo } from "react";
import type { SectionId, CartLine, CustomerInfo, VendorId } from "./types";
import { menuGroups, vendors, FACEBOOK_URL } from "./data";
import {
  loadCart,
  saveCart,
  hydrateCart,
  loadOrderState,
  saveOrderState,
  clearOrderState,
  addToCart as addToCartUtil,
  changeQty as changeQtyUtil,
  updateLineNote as updateLineNoteUtil,
  getCartCount,
  getCartTotalCents,
  centsToMoney,
  groupCart,
  generateOrderId,
  buildCustomerOrder,
  buildVendorOrder,
  buildWhatsAppUrl,
  copyText,
  getCartItemTotalCents,
  normalizeMalaysianMobile,
  isValidMalaysianMobile
} from "./utils";
import { TopNavigation } from "./components/TopNavigation";
import { ImageHeroBanner } from "./components/ImageHeroBanner";
import { VendorCategoryCard } from "./components/VendorCategoryCard";
import { PromoImageCard } from "./components/PromoImageCard";
import { MenuGroupCard } from "./components/MenuGroupCard";
import { SimpleMenuRow } from "./components/SimpleMenuRow";
import { CartVendorGroup } from "./components/CartVendorGroup";
import { OrderTypeSegmentedControl } from "./components/OrderTypeSegmentedControl";
import { WhatsAppSendCard } from "./components/WhatsAppSendCard";
import { BottomStickyCartBar } from "./components/BottomStickyCartBar";
import { ToastNotification } from "./components/ToastNotification";

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState("打包");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [lastOrderId, setLastOrderId] = useState("");
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [openedMap, setOpenedMap] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState({ show: false, message: "" });

  // 加载初始数据
  useEffect(() => {
    setCart(loadCart());
    const orderState = loadOrderState();
    setLastOrderId(orderState.lastOrderId);
    setSentMap(orderState.sentMap);
  }, []);

  // 保存购物车
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // 保存订单状态
  useEffect(() => {
    saveOrderState({ lastOrderId, sentMap });
  }, [lastOrderId, sentMap]);

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const navigate = useCallback((section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const resetOrderProgress = useCallback(() => {
    setLastOrderId("");
    setSentMap({});
    setOpenedMap({});
    clearOrderState();
  }, []);

  const handleAddToCart = useCallback((itemId: string, variantId?: string) => {
    const newCart = addToCartUtil(cart, itemId, variantId);
    if (newCart !== cart) {
      resetOrderProgress();
      setCart(newCart);
    }

    const item = menuGroups
      .flatMap(g => g.items)
      .find(i => i.id === itemId);

    if (item) {
      const variant = item.variants?.find(v => v.id === variantId);
      const variantLabel = variant?.label || "";
      showToast(`${item.name}${variantLabel ? " · " + variantLabel : ""} 已加入购物车`);
    }
  }, [cart, resetOrderProgress, showToast]);

  const handleChangeQty = useCallback((key: string, delta: number) => {
    resetOrderProgress();
    setCart(prev => changeQtyUtil(prev, key, delta));
  }, [resetOrderProgress]);

  const handleUpdateNote = useCallback((key: string, note: string) => {
    resetOrderProgress();
    setCart(prev => updateLineNoteUtil(prev, key, note));
  }, [resetOrderProgress]);

  const handleCustomerNameChange = useCallback((value: string) => {
    resetOrderProgress();
    setCustomerName(value);
  }, [resetOrderProgress]);

  const handleCustomerPhoneChange = useCallback((value: string) => {
    resetOrderProgress();
    setCustomerPhone(value);
  }, [resetOrderProgress]);

  const handleOrderTypeChange = useCallback((value: string) => {
    resetOrderProgress();
    setOrderType(value);
  }, [resetOrderProgress]);

  const handleOrderNoteChange = useCallback((value: string) => {
    resetOrderProgress();
    setOrderNote(value);
  }, [resetOrderProgress]);

  const validateCustomer = useCallback((): boolean => {
    if (!customerName.trim()) {
      showToast("请填写顾客姓名");
      return false;
    }

    const normalizedPhone = normalizeMalaysianMobile(customerPhone);
    if (!normalizedPhone) {
      showToast("请填写联络电话");
      return false;
    }

    if (!isValidMalaysianMobile(normalizedPhone)) {
      showToast("电话格式不正确，请填写马来西亚手机号码，例如 012-3456789");
      return false;
    }

    return true;
  }, [customerName, customerPhone, showToast]);

  const normalizedCustomerPhone = normalizeMalaysianMobile(customerPhone);
  const customerInfo = useMemo<CustomerInfo>(() => ({
    name: customerName.trim() || "未填写",
    phone: normalizedCustomerPhone || customerPhone.trim() || "未填写",
    type: orderType,
    note: orderNote.trim()
  }), [customerName, customerPhone, normalizedCustomerPhone, orderType, orderNote]);
  const customerOrderPreview = useMemo(() => (
    buildCustomerOrder(lastOrderId, cart, customerInfo)
  ), [lastOrderId, cart, customerInfo]);

  const cartCount = getCartCount(cart);
  const cartTotal = centsToMoney(getCartTotalCents(cart));
  const vendorGroups = useMemo(() => groupCart(cart), [cart]);

  // ADDED: clearing the cart is only safe after every active vendor order is confirmed sent.
  const pendingVendorNames = useMemo(() => (
    vendorGroups
      .filter((group) => !sentMap[group.vendor.id])
      .map((group) => group.vendor.name)
  ), [vendorGroups, sentMap]);
  const allVendorOrdersSent = vendorGroups.length > 0 && pendingVendorNames.length === 0;

  const handleGenerateOrder = useCallback(() => {
    if (cart.length === 0) {
      showToast("购物车是空的");
      return;
    }

    const currentCart = hydrateCart(cart);
    const cartChanged = JSON.stringify(currentCart) !== JSON.stringify(cart);

    if (currentCart.length !== cart.length) {
      resetOrderProgress();
      setCart(currentCart);
      showToast("购物车中有已失效商品，已自动移除");
      return;
    }

    if (cartChanged) {
      resetOrderProgress();
      setCart(currentCart);
    }

    if (!validateCustomer()) return;

    if (!lastOrderId || cartChanged) {
      setLastOrderId(generateOrderId());
      setSentMap({});
      setOpenedMap({});
    }

    navigate("confirm");
  }, [cart, validateCustomer, lastOrderId, navigate, resetOrderProgress, showToast]);

  const handleCopyCustomerOrder = useCallback(() => {
    const orderText = buildCustomerOrder(lastOrderId, cart, customerInfo);

    copyText(orderText)
      .then(() => showToast("顾客总订单已复制"))
      .catch(() => showToast("复制失败，请长按文字手动复制"));
  }, [cart, customerInfo, lastOrderId, showToast]);

  const handleCopyVendorOrder = useCallback((vendorId: VendorId) => {
    const orderText = buildVendorOrder(lastOrderId, cart, customerInfo, vendorId);

    copyText(orderText)
      .then(() => showToast(`${vendors[vendorId].name}分单已复制`))
      .catch(() => showToast("复制失败，请长按文字手动复制"));
  }, [cart, customerInfo, lastOrderId, showToast]);

  const handleOpenWhatsApp = useCallback((vendorId: VendorId) => {
    setOpenedMap(prev => ({ ...prev, [vendorId]: true }));
  }, []);

  const handleMarkSent = useCallback((vendorId: VendorId) => {
    if (!openedMap[vendorId]) {
      showToast(`请先打开${vendors[vendorId].name} WhatsApp`);
      return;
    }

    setSentMap(prev => ({ ...prev, [vendorId]: true }));
  }, [openedMap, showToast]);

  const handleClearOrder = useCallback(() => {
    if (cart.length > 0 && pendingVendorNames.length > 0) {
      showToast(`请先发送全部档口分单：${pendingVendorNames.join("、")}`);
      return;
    }

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setOrderNote("");
    setLastOrderId("");
    setSentMap({});
    setOpenedMap({});
    clearOrderState();
    showToast("订单已完成，购物车已清空");
    navigate("home");
  }, [cart.length, pendingVendorNames, navigate, showToast]);

  return (
    <div className="min-h-screen pb-[calc(var(--cartbar-h,76px)+24px+var(--safe-bottom))] md:pb-[calc(var(--cartbar-h,76px)+28px)]">
      <style>{`
        :root {
          --bg: #FFF6E8;
          --paper: #FFFDF8;
          --ink: #25130F;
          --muted: #80685B;
          --red: #A91616;
          --red-dark: #7F1010;
          --gold: #C99A34;
          --whatsapp: #118C43;
          --green2: #0F6F37;
          --cream: #FFEFD1;
          --line: rgba(95, 48, 35, 0.14);
          --shadow-soft: 0 12px 36px rgba(76, 34, 20, 0.12);
          --shadow-card: 0 8px 22px rgba(76, 34, 20, 0.09);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --topbar-h: 74px;
          --cartbar-h: 76px;
          --radius-card: 24px;
        }

        @media (min-width: 768px) {
          :root {
            --topbar-h: 82px;
          }
        }

        body {
          background-image:
            radial-gradient(circle at 10% -8%, rgba(201,154,52,0.20), transparent 30rem),
            radial-gradient(circle at 100% 14%, rgba(169,22,22,0.12), transparent 32rem),
            linear-gradient(180deg, #fff7ec 0%, #fff6e8 48%, #fffdf8 100%);
          background-attachment: fixed, scroll, scroll, scroll;
        }

        /* Drop real images into public/assets with these filenames.
           If an image is missing, the gradient fallback still renders and build stays green. */
        .hero-home { background-image: linear-gradient(145deg, rgba(178,29,29,0.72) 0%, rgba(120,16,16,0.62) 58%, rgba(64,18,13,0.80) 100%), url('/assets/hero-kopitiam.webp'), linear-gradient(145deg, #b21d1d 0%, #781010 58%, #40120d 100%); }
        .hero-drinks { background-image: linear-gradient(135deg, rgba(75,36,23,0.64) 0%, rgba(157,28,28,0.54) 50%, rgba(225,182,80,0.48) 100%), url('/assets/drinks-counter.webp'), linear-gradient(135deg, #4b2417 0%, #9d1c1c 50%, #e1b650 100%); }
        .hero-noodles { background-image: linear-gradient(135deg, rgba(61,33,24,0.66) 0%, rgba(127,16,16,0.54) 48%, rgba(201,154,52,0.46) 100%), url('/assets/noodles.webp'), linear-gradient(135deg, #3d2118 0%, #7f1010 48%, #c99a34 100%); }
        .hero-wok { background-image: linear-gradient(135deg, rgba(53,23,15,0.68) 0%, rgba(143,23,23,0.56) 48%, rgba(200,123,46,0.48) 100%), url('/assets/wok-cooking.webp'), linear-gradient(135deg, #35170f 0%, #8f1717 48%, #c87b2e 100%); }
        .hero-cheecheongfun { background-image: linear-gradient(135deg, rgba(74,32,21,0.66) 0%, rgba(169,22,22,0.54) 46%, rgba(237,208,141,0.48) 100%), url('/assets/chee-cheong-fun.webp'), linear-gradient(135deg, #4a2015 0%, #a91616 46%, #edd08d 100%); }
        .hero-about { background-image: linear-gradient(135deg, rgba(59,36,25,0.68) 0%, rgba(111,42,25,0.56) 48%, rgba(201,154,52,0.48) 100%), url('/assets/shop-front.webp'), linear-gradient(135deg, #3b2419 0%, #6f2a19 48%, #c99a34 100%); }
        .promo-kopitiam { background-image: linear-gradient(90deg,rgba(37,19,15,0.78),rgba(37,19,15,0.42)), url('/assets/shop-front.webp'), linear-gradient(135deg,rgba(169,22,22,0.96)_0%,rgba(127,16,16,0.88)_54%,rgba(201,154,52,0.72)_100%); }
      `}</style>

      <TopNavigation
        activeSection={activeSection}
        cartCount={cartCount}
        onNavigate={navigate}
      />

      <main className="max-w-[1180px] lg:max-w-[1360px] mx-auto">
        {/* Home Section */}
        {activeSection === "home" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="Bukit Siput · Segamat · 四档口 WhatsApp 点餐"
              title="龍運轩咖啡店"
              description="一碗热面，一杯好茶，一份现点现做的本地味道。顾客看到同一张总订单，系统会自动按水档、面档、煮炒、广西卷肠粉分开整理成档口分单。"
              bgClass="hero-home"
              isHome
            >
              <div className="w-full max-w-[780px] grid grid-cols-1 md:grid-cols-4 gap-2.5 mt-6 items-stretch">
                <button
                  onClick={() => navigate("drinks")}
                  className="min-h-[48px] rounded-2xl px-4 py-3 bg-[#FFEFD1] text-[#7F1010] font-extrabold shadow-[0_12px_26px_rgba(34,10,6,0.18)] active:scale-95 transition-transform"
                >
                  水档菜单
                </button>
                <button
                  onClick={() => navigate("noodles")}
                  className="min-h-[48px] rounded-2xl px-4 py-3 bg-[#FFEFD1] text-[#7F1010] font-extrabold shadow-[0_12px_26px_rgba(34,10,6,0.18)] active:scale-95 transition-transform"
                >
                  面档菜单
                </button>
                <button
                  onClick={() => navigate("wok")}
                  className="min-h-[48px] rounded-2xl px-4 py-3 bg-[#FFEFD1] text-[#7F1010] font-extrabold shadow-[0_12px_26px_rgba(34,10,6,0.18)] active:scale-95 transition-transform"
                >
                  煮炒菜单
                </button>
                <button
                  onClick={() => navigate("cheecheongfun")}
                  className="min-h-[48px] rounded-2xl px-4 py-3 bg-[#FFEFD1] text-[#7F1010] font-extrabold shadow-[0_12px_26px_rgba(34,10,6,0.18)] active:scale-95 transition-transform"
                >
                  卷肠粉
                </button>
              </div>
            </ImageHeroBanner>

            <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-3 mt-[18px]">
              <VendorCategoryCard
                title="水档菜单"
                description="饮品有小、大、冰规格，点击规格即可加入购物车。"
                mark="水"
                onClick={() => navigate("drinks")}
              />
              <VendorCategoryCard
                title="面档菜单"
                description="云吞面与面薄可选小 / 中 / 大，云吞单价加入。"
                mark="面"
                onClick={() => navigate("noodles")}
              />
              <VendorCategoryCard
                title="煮炒菜单"
                description="饭类、粉面类、粥品，适合午餐和打包。"
                mark="炒"
                onClick={() => navigate("wok")}
              />
              <VendorCategoryCard
                title="广西卷肠粉"
                description="素粉、菜粉、加肉、全家福和加鸡蛋。"
                mark="粉"
                onClick={() => navigate("cheecheongfun")}
              />
              <VendorCategoryCard
                title="本地介绍"
                description="店铺说明、营业时间、地址、Facebook 与导航。"
                mark="介"
                onClick={() => navigate("about")}
              />
            </div>

            <PromoImageCard onViewCart={() => navigate("cart")} />
          </section>
        )}

        {/* Drinks Section */}
        {activeSection === "drinks" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 水档"
              title="水档菜单"
              description="咖啡、奶茶、冰饮、鸡蛋与烤面包。饮品请直接选择小 / 大 / 冰规格加入购物车。"
              bgClass="hero-drinks"
            />
            <div className="my-[14px] rounded-[22px] px-4 py-3.5 bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] leading-relaxed">
              此页面商品会归入【水档】分单。顾客最后仍然看到同一张总订单。
            </div>
            {menuGroups
              .filter(g => g.mount === "drinksMenu")
              .map(group => (
                <MenuGroupCard key={group.title} title={group.title} itemCount={group.items.length}>
                  {group.items.map(item => (
                    <SimpleMenuRow key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </MenuGroupCard>
              ))}
          </section>
        )}

        {/* Noodles Section */}
        {activeSection === "noodles" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 面档"
              title="面档菜单"
              description="干捞云吞面、云吞面汤、面薄汤、素面与云吞。熟悉的本地早市味道。"
              bgClass="hero-noodles"
            />
            <div className="my-[14px] rounded-[22px] px-4 py-3.5 bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] leading-relaxed">
              此页面商品会归入【面档】分单。可在购物车里给每项填写备注，例如不要葱、多酱。
            </div>
            {menuGroups
              .filter(g => g.mount === "noodlesMenu")
              .map(group => (
                <MenuGroupCard key={group.title} title={group.title} itemCount={group.items.length}>
                  {group.items.map(item => (
                    <SimpleMenuRow key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </MenuGroupCard>
              ))}
          </section>
        )}

        {/* Wok Section */}
        {activeSection === "wok" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 煮炒档"
              title="煮炒菜单"
              description="饭类、粉面、粥品现点现做，适合午餐、打包和简单吃一餐。"
              bgClass="hero-wok"
            />
            <div className="my-[14px] rounded-[22px] px-4 py-3.5 bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] leading-relaxed">
              此页面商品会归入【如月小吃 / 煮炒档】分单。
            </div>
            {menuGroups
              .filter(g => g.mount === "wokMenu")
              .map(group => (
                <MenuGroupCard key={group.title} title={group.title} itemCount={group.items.length}>
                  {group.items.map(item => (
                    <SimpleMenuRow key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </MenuGroupCard>
              ))}
          </section>
        )}

        {/* Chee Cheong Fun Section */}
        {activeSection === "cheecheongfun" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 广西卷肠粉"
              title="广西卷肠粉"
              description="可选素粉、菜粉、菜加肉、全肉、全家福，也可额外加鸡蛋。"
              bgClass="hero-cheecheongfun"
            />
            <div className="my-[14px] rounded-[22px] px-4 py-3.5 bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] leading-relaxed">
              此页面商品会归入【广西卷肠粉档】分单。
            </div>
            {menuGroups
              .filter(g => g.mount === "cheecheongfunMenu")
              .map(group => (
                <MenuGroupCard key={group.title} title={group.title} itemCount={group.items.length}>
                  {group.items.map(item => (
                    <SimpleMenuRow key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </MenuGroupCard>
              ))}
          </section>
        )}

        {/* About Section */}
        {activeSection === "about" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="Bukit Siput · Segamat"
              title="本地介绍"
              description="龍運轩是一间服务本地街坊的中式咖啡店，适合早餐、午餐、打包和一家人简单吃一餐。"
              bgClass="hero-about"
            />

            <div className="my-4 rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden p-4">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-3">
                <div className="rounded-[22px] p-4 bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-2 text-[#7F1010] text-[17px] font-black">营业时间</h3>
                  <ul className="m-0 p-0 list-none grid gap-1.5 text-[#80685B] text-sm leading-relaxed">
                    {[
                      ["周一", "06:00 - 13:30"],
                      ["周二", "停止营业"],
                      ["周三", "06:00 - 13:30"],
                      ["周四", "06:00 - 13:30"],
                      ["周五", "06:00 - 13:30"],
                      ["周六", "06:00 - 13:30"],
                      ["周日", "06:00 - 13:30"]
                    ].map(([day, hours]) => (
                      <li key={day} className="flex justify-between gap-3 border-b border-dashed border-[var(--line)] pb-1.5 last:border-b-0 last:pb-0">
                        <span>{day}</span>
                        <strong className="font-extrabold">{hours}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[22px] p-4 bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-2 text-[#7F1010] text-[17px] font-black">地址</h3>
                  <p className="m-0 text-[#80685B] leading-[1.7] text-sm">
                    LOT 2891 BWH, JALAN SULTAN BUKIT SIPUT,<br />
                    Segamat, Malaysia, 85020
                  </p>
                  <div className="h-3" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=LOT%202891%20BWH%20JALAN%20SULTAN%20BUKIT%20SIPUT%20Segamat%20Malaysia%2085020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-2xl px-4 py-3 bg-[rgba(255,253,248,0.55)] border border-[var(--line)] text-[#7F1010] font-extrabold text-center active:scale-95 transition-transform"
                  >
                    Google Maps 导航
                  </a>
                </div>

                <div className="rounded-[22px] p-4 bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-2 text-[#7F1010] text-[17px] font-black">Facebook</h3>
                  <p className="m-0 text-[#80685B] leading-[1.7] text-sm">
                    <span lang="ms">KEDAI KOPI B.Siput</span> 龍運轩
                  </p>
                  <div className="h-3" />
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-2xl px-4 py-3 bg-[rgba(255,253,248,0.55)] border border-[var(--line)] text-[#7F1010] font-extrabold text-center active:scale-95 transition-transform mb-3"
                  >
                    打开官方 Facebook 页面
                  </a>
                  <a
                    href={buildWhatsAppUrl("601161379373", "你好，我想询问龍運轩咖啡店点餐。")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-2xl px-4 py-3 bg-gradient-to-br from-[#118C43] to-[#0F6F37] text-white font-extrabold text-center shadow-[0_12px_24px_rgba(17,140,67,0.22)] active:scale-95 transition-transform"
                  >
                    WhatsApp 联系 / 下单
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cart Section */}
        {activeSection === "cart" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <div className="mb-3.5">
              <h2 className="m-0 text-[clamp(24px,7vw,44px)] leading-tight tracking-tight text-[#7F1010] font-black">
                购物车
              </h2>
              <p className="mt-2 mb-0 text-[#80685B] leading-[1.68] text-sm max-w-[720px]">
                这是一张顾客总订单，系统会按四个档口自动分组。每个档口会生成独立分单。
              </p>
            </div>

            <div className="rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
              {cart.length === 0 ? (
                <div className="py-[34px] px-[18px] text-center text-[#80685B] leading-[1.7]">
                  购物车是空的。<br />
                  先选择水档、面档、煮炒或广西卷肠粉商品。
                </div>
              ) : (
                <>
                  {vendorGroups.map(group => (
                    <CartVendorGroup
                      key={group.vendor.id}
                      vendorName={group.vendor.name}
                      lines={group.lines}
                      subtotal={group.lines.reduce((sum, line) => sum + getCartItemTotalCents(line), 0)}
                      onChangeQty={handleChangeQty}
                      onUpdateNote={handleUpdateNote}
                    />
                  ))}

                  <div className="p-4 grid gap-2.5">
                    <div className="flex items-center justify-between gap-3 text-[#80685B] leading-relaxed">
                      <span>档口订单</span>
                      <strong className="font-extrabold">{vendorGroups.length} 份</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#80685B] leading-relaxed">
                      <span>商品数量</span>
                      <strong className="font-extrabold">{cartCount} 项</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#7F1010] text-xl font-black pt-2 border-t border-dashed border-[var(--line)]">
                      <span>总计</span>
                      <strong>{cartTotal}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-4 rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-4">
                <h3 className="m-0 mb-3 text-[#7F1010] font-black">订单资料</h3>

                <div className="grid md:grid-cols-2 gap-3">
                  <label>
                    <span className="block text-xs font-extrabold text-[#7F1010] mb-1.5">顾客姓名</span>
                    <input
                      value={customerName}
                      onChange={(e) => handleCustomerNameChange(e.target.value)}
                      maxLength={40}
                      className="w-full min-h-[48px] rounded-2xl px-3.5 py-3 border border-[var(--line)] outline-none bg-[var(--paper)] text-[var(--ink)] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[0_0_0_4px_rgba(169,22,22,0.08)]"
                      placeholder="例如：Ah Ming"
                      autoComplete="name"
                    />
                  </label>

                  <label>
                    <span className="block text-xs font-extrabold text-[#7F1010] mb-1.5">电话</span>
                    <input
                      value={customerPhone}
                      onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                      type="tel"
                      maxLength={15}
                      className="w-full min-h-[48px] rounded-2xl px-3.5 py-3 border border-[var(--line)] outline-none bg-[var(--paper)] text-[var(--ink)] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[0_0_0_4px_rgba(169,22,22,0.08)]"
                      placeholder="例如：012-345 6789"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <span className="block text-xs font-extrabold text-[#7F1010] mb-1.5">取餐方式</span>
                    <OrderTypeSegmentedControl selectedType={orderType} onSelectType={handleOrderTypeChange} />
                  </div>

                  <label className="md:col-span-2">
                    <span className="block text-xs font-extrabold text-[#7F1010] mb-1.5">整张订单备注</span>
                    <textarea
                      value={orderNote}
                      onChange={(e) => handleOrderNoteChange(e.target.value)}
                      maxLength={200}
                      className="w-full min-h-[86px] rounded-2xl px-3.5 py-3 border border-[var(--line)] outline-none bg-[var(--paper)] text-[var(--ink)] resize-y leading-relaxed focus:border-[rgba(169,22,22,0.42)] focus:shadow-[0_0_0_4px_rgba(169,22,22,0.08)]"
                      placeholder="例如：全部少辣、饮料少甜、分开打包"
                    />
                  </label>
                </div>

                <div className="h-px bg-[var(--line)] my-3.5" />

                <button
                  onClick={handleGenerateOrder}
                  className="w-full min-h-[48px] rounded-2xl px-4 py-3 bg-gradient-to-br from-[#A91616] to-[#7F1010] text-white font-extrabold shadow-[0_12px_24px_rgba(169,22,22,0.24)] active:scale-95 transition-transform"
                >
                  生成订单确认
                </button>
              </div>
            )}
          </section>
        )}

        {/* Confirm Section */}
        {activeSection === "confirm" && (
          <section className="px-3.5 pt-5 md:px-5 md:pt-7 lg:px-[30px] animate-[fadeIn_0.22s_ease]">
            <div className="mb-3.5">
              <h2 className="m-0 text-[clamp(24px,7vw,44px)] leading-tight tracking-tight text-[#7F1010] font-black">
                订单确认
              </h2>
              <p className="mt-2 mb-0 text-[#80685B] leading-[1.68] text-sm max-w-[720px]">
                顾客是一张总订单；四个档口各自生成自己的分单，并带同一个总订单编号。
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] py-[34px] px-[18px] text-center text-[#80685B] leading-[1.7]">
                没有商品，无法生成订单。
              </div>
            ) : (
              <>
                <div className="rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-4">
                  <div className="rounded-[18px] px-3.5 py-3 bg-[#fff1d4] text-[#7a4b00] border border-[rgba(201,154,52,0.28)] leading-relaxed text-[13px]">
                    这是同一张顾客总订单，下面会拆成 {vendorGroups.length} 个档口分单。WhatsApp 无法网页自动一次发送给多人，顾客需要逐个点击发送。
                  </div>

                  <div className="mt-4 grid gap-2.5">
                    <div className="flex items-center justify-between gap-3 text-[#80685B] leading-relaxed">
                      <span>订单编号</span>
                      <strong className="font-extrabold">{lastOrderId}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#80685B] leading-relaxed">
                      <span>档口分单</span>
                      <strong className="font-extrabold">{vendorGroups.length} 份</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#7F1010] text-xl font-black pt-2 border-t border-dashed border-[var(--line)]">
                      <span>总计</span>
                      <strong>{cartTotal}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCustomerOrder}
                    className="w-full mt-4 min-h-[48px] rounded-2xl px-4 py-3 bg-[#2A1712] text-[#fff6e8] font-extrabold active:scale-95 transition-transform"
                  >
                    复制顾客总订单
                  </button>

                  <button
                    type="button"
                    onClick={handleClearOrder}
                    disabled={!allVendorOrdersSent}
                    aria-disabled={!allVendorOrdersSent}
                    title={allVendorOrdersSent ? "全部档口已确认发送" : `仍未发送：${pendingVendorNames.join("、")}`}
                    className={`w-full mt-2.5 min-h-[48px] rounded-2xl px-4 py-3 border font-extrabold transition-transform ${
                      allVendorOrdersSent
                        ? "bg-[rgba(255,253,248,0.55)] border-[var(--line)] text-[#7F1010] active:scale-95"
                        : "bg-[#f3eee8] border-[var(--line)] text-[#9d8b80] cursor-not-allowed"
                    }`}
                  >
                    {allVendorOrdersSent ? "完成并清空购物车" : "请先发送全部档口分单"}
                  </button>
                </div>

                <div className="mt-4 rounded-[28px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-4">
                  <h3 className="m-0 mb-3 text-[#7F1010] font-black">顾客总订单预览</h3>
                  <pre className="whitespace-pre-wrap break-words bg-[#2A1712] text-[#fff5e4] rounded-[20px] p-3.5 leading-relaxed text-[13px] max-h-[360px] overflow-auto border border-white/10 m-0">
                    {customerOrderPreview}
                  </pre>
                </div>

                <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {vendorGroups.map(group => {
                    const msg = buildVendorOrder(lastOrderId, cart, customerInfo, group.vendor.id);
                    const url = buildWhatsAppUrl(group.vendor.whatsapp, msg);
                    const subtotal = group.lines.reduce((sum, line) => sum + getCartItemTotalCents(line), 0);

                    return (
                      <WhatsAppSendCard
                        key={group.vendor.id}
                        vendorName={group.vendor.name}
                        itemCount={group.lines.length}
                        subtotal={centsToMoney(subtotal)}
                        whatsappUrl={url}
                        hasOpened={!!openedMap[group.vendor.id]}
                        isSent={!!sentMap[group.vendor.id]}
                        onOpen={() => handleOpenWhatsApp(group.vendor.id)}
                        onMarkSent={() => handleMarkSent(group.vendor.id)}
                        onCopy={() => handleCopyVendorOrder(group.vendor.id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <BottomStickyCartBar itemCount={cartCount} total={cartTotal} onViewCart={() => navigate("cart")} />

      <ToastNotification message={toast.message} show={toast.show} onHide={hideToast} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
