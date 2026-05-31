import { useState } from "react";
import type { SectionId } from "../types";

interface TopNavigationProps {
  activeSection: SectionId;
  cartCount: number;
  onNavigate: (section: SectionId) => void;
}

const navItems: Array<{ id: SectionId; label: string }> = [
  { id: "home", label: "首页" },
  { id: "drinks", label: "水档" },
  { id: "noodles", label: "面档" },
  { id: "wok", label: "煮炒" },
  { id: "cheecheongfun", label: "卷肠粉" },
  { id: "about", label: "本地介绍" },
  { id: "cart", label: "购物车" }
];

export function TopNavigation({ activeSection, cartCount, onNavigate }: TopNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (section: SectionId) => {
    setIsMenuOpen(false);
    onNavigate(section);
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(255,250,241,0.92)] backdrop-blur-xl border-b border-[rgba(127,16,16,0.12)] shadow-[0_10px_30px_rgba(76,34,20,0.07)]">
      <div className="max-w-[1180px] mx-auto px-3.5 py-2.5 md:px-5">
        <div className="flex items-center gap-2.5 h-[54px] md:h-[62px]">
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#A91616] to-[#7F1010] text-[#fff6df] flex items-center justify-center text-2xl font-black tracking-tighter shadow-[0_10px_22px_rgba(169,22,22,0.22)] border-2 border-[rgba(201,154,52,0.62)] relative overflow-hidden"
            aria-label="回到首页"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent rounded-full" />
            <span className="relative">龍</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[18px] md:text-[20px] font-black text-[#7F1010] tracking-[0.08em] truncate">
              龍運轩咖啡店
            </div>
            <div className="text-[11px] text-[#80685B] tracking-[0.08em] truncate">
              <span lang="ms">KEDAI KOPI B.Siput</span> · 四档口 WhatsApp 分单
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2" aria-label="主要导航">
            {navItems.map(nav => (
              <button
                type="button"
                key={nav.id}
                onClick={() => handleNavigate(nav.id)}
                className={`min-h-[38px] min-w-[68px] rounded-2xl px-3 py-2 font-extrabold text-sm transition-all ${
                  activeSection === nav.id || (activeSection === "confirm" && nav.id === "cart")
                    ? "bg-[#A91616] text-[#fffdf8] shadow-[0_10px_20px_rgba(169,22,22,0.18)]"
                    : "bg-transparent text-[#80685B] hover:bg-[#fff6e8]"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="md:hidden w-[42px] h-[42px] rounded-2xl bg-[rgba(255,253,248,0.92)] text-[#7F1010] border border-[var(--line)] shadow-[0_8px_18px_rgba(64,32,20,0.08)] flex items-center justify-center font-black"
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? "×" : "☰"}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("cart")}
              className="w-[42px] h-[42px] rounded-2xl bg-[rgba(255,253,248,0.92)] text-[#7F1010] border border-[var(--line)] shadow-[0_8px_18px_rgba(64,32,20,0.08)] flex items-center justify-center relative"
              aria-label="购物车"
            >
              🧺
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#A91616] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-[#FFF6E8]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            className="md:hidden mt-2 grid grid-cols-2 gap-2 rounded-[22px] bg-[rgba(255,253,248,0.96)] border border-[var(--line)] p-2 shadow-[0_14px_32px_rgba(76,34,20,0.10)]"
            aria-label="手机导航"
          >
            {navItems.map(nav => (
              <button
                type="button"
                key={nav.id}
                onClick={() => handleNavigate(nav.id)}
                className={`min-h-[42px] rounded-2xl px-3 py-2 font-extrabold text-sm transition-all ${
                  activeSection === nav.id || (activeSection === "confirm" && nav.id === "cart")
                    ? "bg-[#A91616] text-[#fffdf8]"
                    : "bg-[#fff7ea] text-[#80685B]"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
