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

const navButtonTypography =
  "text-[length:var(--text-body-sm-size)] font-[var(--text-button-weight)] leading-[var(--text-body-sm-line-height)]";

export function TopNavigation({ activeSection, cartCount, onNavigate }: TopNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (section: SectionId) => {
    setIsMenuOpen(false);
    onNavigate(section);
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(255,250,241,0.92)] backdrop-blur-xl border-b border-[rgba(127,16,16,0.12)] shadow-[var(--shadow-soft)]">
      <div className="max-w-[1180px] mx-auto px-[var(--section-padding-x)] py-[var(--space-3)]">
        <div className="flex items-center gap-[var(--card-gap)] h-[54px] md:h-[62px]">
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="w-[46px] h-[46px] rounded-[var(--radius-full)] bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-[#fff6df] flex items-center justify-center text-[length:var(--font-size-2xl)] font-[var(--font-weight-black)] tracking-tighter shadow-[var(--shadow-brand)] border-2 border-[rgba(201,154,52,0.62)] relative overflow-hidden"
            aria-label="回到首页"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent rounded-full" />
            <span className="relative">龍</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[length:var(--font-size-lg)] md:text-[length:var(--font-size-xl)] font-[var(--text-h4-weight)] leading-[var(--text-h4-line-height)] text-[var(--color-brand-red-dark)] tracking-[0.08em] truncate">
              龍運轩咖啡店
            </div>
            <div className="text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)] text-[var(--color-text-secondary)] tracking-[0.08em] truncate">
              <span lang="ms">KEDAI KOPI B.Siput</span> · 四档口 WhatsApp 分单
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-[var(--space-2)]" aria-label="主要导航">
            {navItems.map(nav => (
              <button
                type="button"
                key={nav.id}
                onClick={() => handleNavigate(nav.id)}
                className={`min-h-[38px] min-w-[68px] rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-2)] ${navButtonTypography} transition-all ${
                  activeSection === nav.id || (activeSection === "confirm" && nav.id === "cart")
                    ? "bg-[var(--color-brand-red)] text-[var(--color-surface-primary)] shadow-[var(--shadow-brand)]"
                    : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-[var(--space-2)]">
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="md:hidden min-w-[44px] min-h-[44px] rounded-[var(--radius-lg)] bg-[rgba(255,253,248,0.92)] text-[var(--color-brand-red-dark)] border border-[var(--line)] shadow-[var(--shadow-subtle)] flex items-center justify-center font-[var(--font-weight-black)]"
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? "×" : "☰"}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("cart")}
              className="min-w-[44px] min-h-[44px] rounded-[var(--radius-lg)] bg-[rgba(255,253,248,0.92)] text-[var(--color-brand-red-dark)] border border-[var(--line)] shadow-[var(--shadow-subtle)] flex items-center justify-center relative"
              aria-label="购物车"
            >
              🧺
              {cartCount > 0 && (
                <span className="absolute -top-[var(--space-1)] -right-[var(--space-1)] min-w-[20px] h-[20px] px-[var(--space-2)] rounded-full bg-[var(--color-brand-red)] text-white text-[length:var(--text-caption-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] flex items-center justify-center border-2 border-[var(--color-surface-secondary)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            className="md:hidden mt-[var(--space-2)] grid grid-cols-2 gap-[var(--space-2)] rounded-[var(--radius-lg)] bg-[rgba(255,253,248,0.96)] border border-[var(--line)] p-[var(--space-2)] shadow-[var(--shadow-elevated)]"
            aria-label="手机导航"
          >
            {navItems.map(nav => (
              <button
                type="button"
                key={nav.id}
                onClick={() => handleNavigate(nav.id)}
                className={`min-h-[44px] rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-2)] ${navButtonTypography} transition-all ${
                  activeSection === nav.id || (activeSection === "confirm" && nav.id === "cart")
                    ? "bg-[var(--color-brand-red)] text-[var(--color-surface-primary)]"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]"
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
