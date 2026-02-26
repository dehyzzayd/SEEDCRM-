"use client";

/**
 * DehydLogo — inline SVG logo, fully theme-aware.
 * No PNG, no CSS invert hacks — just clean vectors.
 *
 * Props
 *   variant  "full"  → lightning bolt  +  "Dehy" wordmark  (default)
 *            "icon"  → lightning bolt only
 *   color    override fill color (default: "currentColor" so it inherits)
 *   height   px height (width auto-scales)
 */

interface LogoProps {
  variant?: "full" | "icon";
  color?: string;
  height?: number;
  className?: string;
}

export function DehydLogo({
  variant = "full",
  color = "currentColor",
  height = 32,
  className = "",
}: LogoProps) {
  if (variant === "icon") {
    /* ── Lightning bolt only ─────────────────────────────────────── */
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        height={height}
        width={height}          /* square */
        fill={color}
        className={className}
        aria-label="Dehy"
      >
        {/* Solid lightning bolt */}
        <path d="M13 2 L4.5 13.5 H11 L11 22 L19.5 10.5 H13 Z" />
      </svg>
    );
  }

  /* ── Full wordmark: bolt + "Dehy" ────────────────────────────────
     ViewBox: 0 0 160 40  — bolt≈30px wide, text starts at x=38
  ───────────────────────────────────────────────────────────────── */
  const scale = height / 40;
  const width = Math.round(160 * scale);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 40"
      height={height}
      width={width}
      fill={color}
      className={className}
      aria-label="Dehy"
    >
      {/* Bolt — centered vertically in 40px box */}
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />

      {/* "Dehy" — Inter/sans-serif, semi-bold, title-case */}
      {/* D */}
      <text
        x="38"
        y="30"
        fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif"
        fontSize="26"
        fontWeight="600"
        letterSpacing="-0.5"
        fill={color}
      >
        Dehy
      </text>
    </svg>
  );
}
