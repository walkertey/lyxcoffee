import { ReactNode } from "react";

interface ImageHeroBannerProps {
  kicker: string;
  title: string;
  description: string;
  bgClass: string;
  children?: ReactNode;
  isHome?: boolean;
}

export function ImageHeroBanner({ kicker, title, description, bgClass, children, isHome = false }: ImageHeroBannerProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[var(--radius-hero)] border border-white/40 shadow-[var(--shadow-soft)] isolate
        bg-[#4b2b1d] bg-cover bg-center bg-no-repeat
        ${isHome ? "min-h-[390px] md:min-h-[500px] lg:min-h-[540px] px-6 py-6 md:px-[52px] md:py-[52px]" : "min-h-[282px] md:min-h-[360px] px-4 py-[22px] md:px-8 md:py-9"}
        ${isHome ? "flex items-center" : "flex items-end"}
        ${bgClass}
      `}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(37,19,15,0.82)] via-[rgba(37,19,15,0.54)] to-[rgba(37,19,15,0.16)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(201,154,52,0.22),transparent_18rem)] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.34)] z-0" />

      {/* Inner Border */}
      <div className="absolute inset-[14px] border border-[rgba(255,246,232,0.20)] rounded-[calc(var(--radius-hero)-10px)] pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-[720px] text-[#fff8eb]">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[rgba(255,253,248,0.15)] backdrop-blur-[10px] border border-white/18 text-[#FFE7B2] text-xs font-extrabold tracking-[0.05em]">
          {kicker}
        </span>

        <h1
          className={`
            ${isHome ? "text-[clamp(46px,12vw,92px)]" : "text-[clamp(30px,11vw,46px)] md:text-[clamp(30px,8vw,58px)]"}
            leading-[1.02] font-black tracking-[-0.02em] mt-3
            [text-shadow:0_3px_18px_rgba(0,0,0,0.24)]
          `}
        >
          {title}
        </h1>

        <p className={`mt-3 leading-[1.75] text-[rgba(255,248,235,0.92)] ${isHome ? "max-w-[760px] text-[15px]" : "text-sm"}`}>
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}
