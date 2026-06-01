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
  const [toast, setToast] = useState({ show: false, message: "", type: "default" as "default" | "success" | "error" | "info", duration: 1700 });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);

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

  const showToast = useCallback((message: string, type: "default" | "success" | "error" | "info" = "default", duration: number = 1700) => {
    setToast({ show: true, message, type, duration });
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
      showToast(`${item.name}${variantLabel ? " · " + variantLabel : ""} 已加入购物车`, "success");
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
    if (fieldErrors.customerName) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.customerName;
        return updated;
      });
    }
  }, [resetOrderProgress, fieldErrors.customerName]);

  const handleCustomerPhoneChange = useCallback((value: string) => {
    resetOrderProgress();
    setCustomerPhone(value);
    if (fieldErrors.customerPhone) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.customerPhone;
        return updated;
      });
    }
  }, [resetOrderProgress, fieldErrors.customerPhone]);

  const handleOrderTypeChange = useCallback((value: string) => {
    resetOrderProgress();
    setOrderType(value);
  }, [resetOrderProgress]);

  const handleOrderNoteChange = useCallback((value: string) => {
    resetOrderProgress();
    setOrderNote(value);
  }, [resetOrderProgress]);

  const validateCustomer = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = "请填写顾客姓名";
    }

    const normalizedPhone = normalizeMalaysianMobile(customerPhone);
    if (!normalizedPhone && !customerPhone.trim()) {
      errors.customerPhone = "请填写联络电话";
    } else if (customerPhone.trim() && !isValidMalaysianMobile(normalizedPhone)) {
      errors.customerPhone = "电话格式不正确，例如 012-3456789";
    }

    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showToast(firstError, "error");
      return false;
    }

    return true;
  }, [customerName, customerPhone, showToast]);

  const isFormValid = useMemo(() => {
    return customerName.trim() !== "" && normalizeMalaysianMobile(customerPhone) !== "";
  }, [customerName, customerPhone]);

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
      showToast("购物车是空的", "info");
      return;
    }

    setIsGeneratingOrder(true);

    setTimeout(() => {
      const currentCart = hydrateCart(cart);
      const cartChanged = JSON.stringify(currentCart) !== JSON.stringify(cart);

      if (currentCart.length !== cart.length) {
        resetOrderProgress();
        setCart(currentCart);
        setIsGeneratingOrder(false);
        showToast("购物车中有已失效商品，已自动移除", "info");
        return;
      }

      if (cartChanged) {
        resetOrderProgress();
        setCart(currentCart);
      }

      if (!validateCustomer()) {
        setIsGeneratingOrder(false);
        return;
      }

      if (!lastOrderId || cartChanged) {
        setLastOrderId(generateOrderId());
        setSentMap({});
        setOpenedMap({});
      }

      navigate("confirm");
      setIsGeneratingOrder(false);
    }, 400);
  }, [cart, validateCustomer, lastOrderId, navigate, resetOrderProgress, showToast]);

  const handleCopyCustomerOrder = useCallback(() => {
    const orderText = buildCustomerOrder(lastOrderId, cart, customerInfo);

    copyText(orderText)
      .then(() => showToast("顾客总订单已复制", "success"))
      .catch(() => showToast("复制失败，请长按文字手动复制"));
  }, [cart, customerInfo, lastOrderId, showToast]);

  const handleCopyVendorOrder = useCallback((vendorId: VendorId) => {
    const orderText = buildVendorOrder(lastOrderId, cart, customerInfo, vendorId);

    copyText(orderText)
      .then(() => showToast(`${vendors[vendorId].name}分单已复制`, "success"))
      .catch(() => showToast("复制失败，请长按文字手动复制"));
  }, [cart, customerInfo, lastOrderId, showToast]);

  const handleOpenWhatsApp = useCallback((vendorId: VendorId) => {
    setOpenedMap(prev => ({ ...prev, [vendorId]: true }));
  }, []);

  const handleMarkSent = useCallback((vendorId: VendorId) => {
    if (!openedMap[vendorId]) {
      showToast(`请先打开${vendors[vendorId].name} WhatsApp`, "info");
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
    showToast("订单已完成，购物车已清空", "success");
    navigate("home");
  }, [cart.length, pendingVendorNames, navigate, showToast]);

  return (
    <div className="min-h-screen pb-[calc(var(--cartbar-h,76px)+var(--space-6)+var(--safe-bottom))] md:pb-[calc(var(--cartbar-h,76px)+var(--space-8))]">
      {/* Styles have been migrated to src/styles/app.css */}

      <TopNavigation
        activeSection={activeSection}
        cartCount={cartCount}
        onNavigate={navigate}
      />

      <main className="max-w-[1180px] lg:max-w-[1360px] mx-auto">
        {/* Home Section */}
        {activeSection === "home" && (
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="Bukit Siput · Segamat · 四档口 WhatsApp 点餐"
              title="龍運轩咖啡店"
              description="一碗热面，一杯好茶，一份现点现做的本地味道。选好档口，点餐后直接发 WhatsApp 给我们。"
              bgClass="hero-home"
              isHome
            >
              <div className="w-full max-w-[780px] grid grid-cols-1 md:grid-cols-4 gap-[var(--card-gap)] mt-[var(--space-6)] items-stretch">
                <button
                  onClick={() => navigate("drinks")}
                  className="min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[#FFEFD1] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] shadow-[var(--shadow-strong)] active:scale-95 transition-transform"
                >
                  水档菜单
                </button>
                <button
                  onClick={() => navigate("noodles")}
                  className="min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[#FFEFD1] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] shadow-[var(--shadow-strong)] active:scale-95 transition-transform"
                >
                  面档菜单
                </button>
                <button
                  onClick={() => navigate("wok")}
                  className="min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[#FFEFD1] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] shadow-[var(--shadow-strong)] active:scale-95 transition-transform"
                >
                  煮炒菜单
                </button>
                <button
                  onClick={() => navigate("cheecheongfun")}
                  className="min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[#FFEFD1] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] shadow-[var(--shadow-strong)] active:scale-95 transition-transform"
                >
                  卷肠粉
                </button>
              </div>
            </ImageHeroBanner>

            <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-[var(--card-gap)] mt-[var(--space-5)]">
              <VendorCategoryCard
                title="水档菜单"
                description="咖啡、奶茶、冰饮，选规格即加入。"
                mark="水"
                onClick={() => navigate("drinks")}
              />
              <VendorCategoryCard
                title="面档菜单"
                description="云吞面、面薄，选大小即加入。"
                mark="面"
                onClick={() => navigate("noodles")}
              />
              <VendorCategoryCard
                title="煮炒菜单"
                description="饭、粉、粥，点击加入购物车。"
                mark="炒"
                onClick={() => navigate("wok")}
              />
              <VendorCategoryCard
                title="广西卷肠粉"
                description="素、菜、加肉、全家福，点击加入。"
                mark="粉"
                onClick={() => navigate("cheecheongfun")}
              />
              <VendorCategoryCard
                title="本地介绍"
                description="营业时间、地址与导航。"
                mark="介"
                onClick={() => navigate("about")}
              />
            </div>

            <PromoImageCard onViewCart={() => navigate("cart")} />
          </section>
        )}

        {/* Drinks Section */}
        {activeSection === "drinks" && (
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 水档"
              title="水档菜单"
              description="咖啡、奶茶、冰饮、鸡蛋与烤面包。饮品请直接选择小 / 大 / 冰规格加入购物车。"
              bgClass="hero-drinks"
            />
            <div className="my-[var(--space-4)] rounded-[var(--radius-lg)] px-[var(--card-padding)] py-[var(--input-padding-y)] bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
              此页商品归入【水档】分单。
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
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 面档"
              title="面档菜单"
              description="干捞云吞面、云吞面汤、面薄汤、素面与云吞。熟悉的本地早市味道。"
              bgClass="hero-noodles"
            />
            <div className="my-[var(--space-4)] rounded-[var(--radius-lg)] px-[var(--card-padding)] py-[var(--input-padding-y)] bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
              此页商品归入【面档】分单。可在购物车为每项加备注。
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
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 煮炒档"
              title="煮炒菜单"
              description="饭类、粉面、粥品现点现做，适合午餐、打包和简单吃一餐。"
              bgClass="hero-wok"
            />
            <div className="my-[var(--space-4)] rounded-[var(--radius-lg)] px-[var(--card-padding)] py-[var(--input-padding-y)] bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
              此页商品归入【如月小吃 / 煮炒档】分单。
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
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="龍運轩 · 广西卷肠粉"
              title="广西卷肠粉"
              description="可选素粉、菜粉、菜加肉、全肉、全家福，也可额外加鸡蛋。"
              bgClass="hero-cheecheongfun"
            />
            <div className="my-[var(--space-4)] rounded-[var(--radius-lg)] px-[var(--card-padding)] py-[var(--input-padding-y)] bg-[linear-gradient(135deg,rgba(169,22,22,0.08),rgba(201,154,52,0.10)),var(--paper)] border border-[var(--line)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
              此页商品归入【广西卷肠粉档】分单。
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
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <ImageHeroBanner
              kicker="Bukit Siput · Segamat"
              title="本地介绍"
              description="龍運轩是一间服务本地街坊的中式咖啡店，适合早餐、午餐、打包和一家人简单吃一餐。"
              bgClass="hero-about"
            />

            <div className="my-[var(--space-4)] rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden p-[var(--card-padding)]">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-[var(--card-gap)]">
                <div className="rounded-[var(--radius-lg)] p-[var(--card-padding)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-[var(--space-2)] text-[#7F1010] text-[length:var(--text-h4-size)] font-[var(--text-h4-weight)] leading-[var(--text-h4-line-height)]">营业时间</h3>
                  <ul className="m-0 p-0 list-none grid gap-[var(--space-2)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                    {[
                      ["周一", "06:00 - 13:30"],
                      ["周二", "停止营业"],
                      ["周三", "06:00 - 13:30"],
                      ["周四", "06:00 - 13:30"],
                      ["周五", "06:00 - 13:30"],
                      ["周六", "06:00 - 13:30"],
                      ["周日", "06:00 - 13:30"]
                    ].map(([day, hours]) => (
                      <li key={day} className="flex justify-between gap-[var(--card-gap)] border-b border-dashed border-[var(--line)] pb-[var(--space-2)] last:border-b-0 last:pb-0">
                        <span>{day}</span>
                        <strong className="font-[var(--font-weight-extrabold)]">{hours}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[var(--radius-lg)] p-[var(--card-padding)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-[var(--space-2)] text-[#7F1010] text-[length:var(--text-h4-size)] font-[var(--text-h4-weight)] leading-[var(--text-h4-line-height)]">地址</h3>
                  <p className="m-0 text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--line-height-loose)]">
                    LOT 2891 BWH, JALAN SULTAN BUKIT SIPUT,<br />
                    Segamat, Malaysia, 85020
                  </p>
                  <div className="h-[var(--space-3)]" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=LOT%202891%20BWH%20JALAN%20SULTAN%20BUKIT%20SIPUT%20Segamat%20Malaysia%2085020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[rgba(255,253,248,0.55)] border border-[var(--line)] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] text-center active:scale-95 transition-transform"
                  >
                    Google Maps 导航
                  </a>
                </div>

                <div className="rounded-[var(--radius-lg)] p-[var(--card-padding)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)]">
                  <h3 className="m-0 mb-[var(--space-2)] text-[#7F1010] text-[length:var(--text-h4-size)] font-[var(--text-h4-weight)] leading-[var(--text-h4-line-height)]">Facebook</h3>
                  <p className="m-0 text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--line-height-loose)]">
                    <span lang="ms">KEDAI KOPI B.Siput</span> 龍運轩
                  </p>
                  <div className="h-[var(--space-3)]" />
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[rgba(255,253,248,0.55)] border border-[var(--line)] text-[#7F1010] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] text-center active:scale-95 transition-transform mb-[var(--space-3)]"
                  >
                    打开官方 Facebook 页面
                  </a>
                  <a
                    href={buildWhatsAppUrl("601161379373", "你好，我想询问龍運轩咖啡店点餐。")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-gradient-to-br from-[var(--color-whatsapp)] to-[var(--color-whatsapp-dark)] text-white text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] text-center shadow-[var(--shadow-whatsapp)] active:scale-95 transition-transform"
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
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <div className="mb-[var(--space-4)]">
              <h2 className="m-0 text-[length:var(--text-h2-size)] leading-[var(--text-h2-line-height)] font-[var(--text-h2-weight)] tracking-tight text-[#7F1010]">
                检查订单
              </h2>
              <p className="mt-[var(--space-2)] mb-0 text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)] max-w-[720px]">
                确认无误后，系统会按档口生成 WhatsApp 分单。
              </p>
            </div>

            <div className="rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
              {cart.length === 0 ? (
                <div className="py-[var(--space-8)] px-[var(--space-5)] text-center text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--line-height-loose)]">
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

                  <div className="p-[var(--card-padding)] grid gap-[var(--card-gap)]">
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                      <span>档口订单</span>
                      <strong className="font-[var(--font-weight-extrabold)]">{vendorGroups.length} 份</strong>
                    </div>
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                      <span>商品数量</span>
                      <strong className="font-[var(--font-weight-extrabold)]">{cartCount} 项</strong>
                    </div>
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#7F1010] text-[length:var(--text-h3-size)] font-[var(--text-h3-weight)] leading-[var(--text-h3-line-height)] pt-[var(--space-2)] border-t border-dashed border-[var(--line)]">
                      <span>总计</span>
                      <strong>{cartTotal}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-[var(--space-4)] rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-[var(--card-padding)]">
                <h3 className="m-0 mb-[var(--space-3)] text-[#7F1010] text-[length:var(--text-h3-size)] font-[var(--text-h3-weight)] leading-[var(--text-h3-line-height)]">订单资料</h3>

                <div className="grid md:grid-cols-2 gap-[var(--card-gap)]">
                  <label>
                    <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                      <span className="block text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] text-[#7F1010]">顾客姓名</span>
                      <span className="text-[#DC2626] font-[var(--text-label-weight)]">*</span>
                    </div>
                    <div className="relative">
                      <input
                        value={customerName}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        maxLength={40}
                        className={`w-full min-h-[48px] rounded-[var(--radius-lg)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] border outline-none bg-[var(--paper)] text-[var(--ink)] transition-all ${
                          fieldErrors.customerName
                            ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[var(--shadow-error)] bg-[#FEF2F2]"
                            : "border-[var(--line)] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[var(--shadow-focus)]"
                        }`}
                        placeholder="例如：Ah Ming"
                        autoComplete="name"
                      />
                      {fieldErrors.customerName && (
                        <div className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[#DC2626] text-[length:var(--font-size-xl)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)]">⚠</div>
                      )}
                    </div>
                    {fieldErrors.customerName && (
                      <p className="mt-[var(--space-1)] text-[#DC2626] text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)]">{fieldErrors.customerName}</p>
                    )}
                  </label>

                  <label>
                    <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                      <span className="block text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] text-[#7F1010]">电话</span>
                      <span className="text-[#DC2626] font-[var(--text-label-weight)]">*</span>
                    </div>
                    <div className="relative">
                      <input
                        value={customerPhone}
                        onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                        type="tel"
                        maxLength={15}
                        className={`w-full min-h-[48px] rounded-[var(--radius-lg)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] border outline-none bg-[var(--paper)] text-[var(--ink)] transition-all ${
                          fieldErrors.customerPhone
                            ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[var(--shadow-error)] bg-[#FEF2F2]"
                            : "border-[var(--line)] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[var(--shadow-focus)]"
                        }`}
                        placeholder="例如：012-345 6789"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                      {fieldErrors.customerPhone && (
                        <div className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[#DC2626] text-[length:var(--font-size-xl)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)]">⚠</div>
                      )}
                    </div>
                    {fieldErrors.customerPhone && (
                      <p className="mt-[var(--space-1)] text-[#DC2626] text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)]">{fieldErrors.customerPhone}</p>
                    )}
                  </label>

                  <div className="md:col-span-2">
                    <span className="block text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] text-[#7F1010] mb-[var(--space-2)]">取餐方式</span>
                    <OrderTypeSegmentedControl selectedType={orderType} onSelectType={handleOrderTypeChange} />
                  </div>

                  <label className="md:col-span-2">
                    <div className="flex items-center justify-between mb-[var(--space-2)]">
                      <span className="block text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] text-[#7F1010]">整张订单备注</span>
                      <span className="text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)] text-[var(--color-text-secondary)]">{orderNote.length}/200</span>
                    </div>
                    <textarea
                      value={orderNote}
                      onChange={(e) => handleOrderNoteChange(e.target.value)}
                      maxLength={200}
                      className="w-full min-h-[86px] rounded-[var(--radius-lg)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] border border-[var(--line)] outline-none bg-[var(--paper)] text-[var(--ink)] resize-y leading-[var(--line-height-relaxed)] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[var(--shadow-focus)] transition-all"
                      placeholder="例如：全部少辣、饮料少甜、分开打包"
                    />
                  </label>
                </div>

                <div className="h-px bg-[var(--line)] my-[var(--space-4)]" />

                {!isFormValid && (
                  <div className="mb-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-lg)] bg-[#FEF3C7] border border-[rgba(245,158,11,0.24)] flex items-start gap-[var(--card-gap)]">
                    <div className="text-[length:var(--font-size-xl)] leading-[var(--line-height-normal)] pt-[var(--space-1)]">⚠️</div>
                    <div>
                      <p className="text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] text-[#92400E]">表单信息不完整</p>
                      <p className="text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)] text-[#B45309] mt-[var(--space-1)]">请填写标有 <span className="font-[var(--text-label-weight)]">*</span> 的必填项后提交订单</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateOrder}
                  className={`w-full min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] shadow-[var(--shadow-brand-heavy)] transition-all flex items-center justify-center gap-[var(--space-2)] ${
                    isFormValid && !isGeneratingOrder
                      ? "bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-white active:scale-95"
                      : "bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed opacity-60"
                  }`}
                  disabled={!isFormValid || isGeneratingOrder}
                >
                  {isGeneratingOrder ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      正在生成订单...
                    </>
                  ) : (
                    "生成订单确认"
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Confirm Section */}
        {activeSection === "confirm" && (
          <section className="px-[var(--section-padding-x)] py-[var(--section-padding-y)] animate-[fadeIn_0.22s_ease]">
            <div className="mb-[var(--space-4)]">
              <h2 className="m-0 text-[length:var(--text-h2-size)] leading-[var(--text-h2-line-height)] font-[var(--text-h2-weight)] tracking-tight text-[#7F1010]">
                订单确认
              </h2>
              <p className="mt-[var(--space-2)] mb-0 text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)] max-w-[720px]">
                顾客是一张总订单；四个档口各自生成自己的分单，并带同一个总订单编号。
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] py-[var(--space-8)] px-[var(--space-5)] text-center text-[var(--color-text-secondary)] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--line-height-loose)]">
                没有商品，无法生成订单。
              </div>
            ) : (
              <>
                <div className="rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-[var(--card-padding)]">
                  <div className="rounded-[var(--radius-md)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] bg-[#fff1d4] text-[#7a4b00] border border-[rgba(201,154,52,0.28)] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                    这是同一张顾客总订单，下面会拆成 {vendorGroups.length} 个档口分单。WhatsApp 无法网页自动一次发送给多人，顾客需要逐个点击发送。
                  </div>

                  <div className="mt-[var(--space-4)] grid gap-[var(--card-gap)]">
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                      <span>订单编号</span>
                      <strong className="font-[var(--font-weight-extrabold)]">{lastOrderId}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#80685B] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)]">
                      <span>档口分单</span>
                      <strong className="font-[var(--font-weight-extrabold)]">{vendorGroups.length} 份</strong>
                    </div>
                    <div className="flex items-center justify-between gap-[var(--card-gap)] text-[#7F1010] text-[length:var(--text-h3-size)] font-[var(--text-h3-weight)] leading-[var(--text-h3-line-height)] pt-[var(--space-2)] border-t border-dashed border-[var(--line)]">
                      <span>总计</span>
                      <strong>{cartTotal}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCustomerOrder}
                    className="w-full mt-[var(--space-4)] min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-[#2A1712] text-[#fff6e8] text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] active:scale-95 transition-transform"
                  >
                    复制顾客总订单
                  </button>

                  <button
                    type="button"
                    onClick={handleClearOrder}
                    disabled={!allVendorOrdersSent}
                    aria-disabled={!allVendorOrdersSent}
                    title={allVendorOrdersSent ? "全部档口已确认发送" : `仍未发送：${pendingVendorNames.join("、")}`}
                    className={`w-full mt-[var(--card-gap)] min-h-[48px] rounded-[var(--radius-lg)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] border text-[length:var(--text-button-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] transition-transform ${
                      allVendorOrdersSent
                        ? "bg-[rgba(255,253,248,0.55)] border-[var(--line)] text-[#7F1010] active:scale-95"
                        : "bg-[#f3eee8] border-[var(--line)] text-[#9d8b80] cursor-not-allowed"
                    }`}
                  >
                    {allVendorOrdersSent ? "完成并清空购物车" : "请先发送全部档口分单"}
                  </button>
                </div>

                <div className="mt-[var(--space-4)] rounded-[var(--radius-3xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] p-[var(--card-padding)]">
                  <h3 className="m-0 mb-[var(--space-3)] text-[#7F1010] text-[length:var(--text-h3-size)] font-[var(--text-h3-weight)] leading-[var(--text-h3-line-height)]">顾客总订单预览</h3>
                  <pre className="whitespace-pre-wrap break-words bg-[#2A1712] text-[#fff5e4] rounded-[var(--radius-lg)] p-[var(--card-padding)] text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)] leading-[var(--text-body-sm-line-height)] max-h-[360px] overflow-auto border border-white/10 m-0">
                    {customerOrderPreview}
                  </pre>
                </div>

                <div className="mt-[var(--space-4)] grid md:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)]">
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

      <ToastNotification message={toast.message} show={toast.show} onHide={hideToast} type={toast.type} duration={toast.duration} />

      {/* fadeIn animation has been migrated to src/styles/app.css */}
    </div>
  );
}
