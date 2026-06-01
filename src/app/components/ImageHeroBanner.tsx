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
        ${isHome ? "min-h-[390px] md:min-h-[500px] lg:min-h-[540px] px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-12)] md:py-[var(--space-12)]" : "min-h-[282px] md:min-h-[360px] px-[var(--card-padding)] py-[var(--space-5)] md:px-[var(--space-8)] md:py-[var(--space-10)]"}
        ${isHome ? "flex items-center" : "flex items-end"}
        ${bgClass}
      `}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(37,19,15,0.82)] via-[rgba(37,19,15,0.54)] to-[rgba(37,19,15,0.16)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(201,154,52,0.22),transparent_18rem)] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.34)] z-0" />

      {/* Inner Border */}
      <div className="absolute inset-[var(--space-4)] border border-[rgba(255,246,232,0.20)] rounded-[calc(var(--radius-hero)-10px)] pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-[720px] text-[#fff8eb]">
        <span className="inline-flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] rounded-full bg-[rgba(255,253,248,0.15)] backdrop-blur-[10px] border border-white/18 text-[#FFE7B2] text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] tracking-[0.05em]">
          {kicker}
        </span>

        <h1
          className={`
            ${isHome
              ? "text-[length:var(--text-display-size)] leading-[var(--text-display-line-height)] font-[var(--text-display-weight)]"
              : "text-[length:var(--text-h1-size)] leading-[var(--text-h1-line-height)] font-[var(--text-h1-weight)]"}
            tracking-[-0.02em] mt-[var(--space-3)]
            [text-shadow:0_3px_18px_rgba(0,0,0,0.24)]
          `}
        >
          {title}
        </h1>

        <p
          className={`mt-[var(--space-3)] leading-[var(--line-height-loose)] text-[rgba(255,248,235,0.92)] ${
            isHome
              ? "max-w-[760px] text-[length:var(--text-body-size)] font-[var(--text-body-weight)]"
              : "text-[length:var(--text-body-sm-size)] font-[var(--text-body-sm-weight)]"
          }`}
        >
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}
